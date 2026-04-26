"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { relativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { MealLogRow } from "@/lib/types";

type Props = {
  stayId: string;
  initialLogs: MealLogRow[];
  stayActive: boolean;
  externalLog?: MealLogRow | null;
};

export default function MealLogSection({ stayId, initialLogs, stayActive, externalLog }: Props) {
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    if (externalLog) {
      setLogs((prev) => [externalLog, ...prev.filter((l) => l.id !== externalLog.id)]);
    }
  }, [externalLog]);
  const [logging, setLogging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");

  const lastMeal = logs[0];

  async function handleLog() {
    setLogging(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: MealLogRow = {
      id: tempId,
      stay_id: stayId,
      created_at: new Date().toISOString(),
    };
    setLogs((prev) => [optimistic, ...prev]);

    try {
      const res = await fetch("/api/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stay_id: stayId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved: MealLogRow = await res.json();
      setLogs((prev) => prev.map((l) => (l.id === tempId ? saved : l)));
    } catch {
      setLogs((prev) => prev.filter((l) => l.id !== tempId));
      toast.error("Couldn't log that — try again");
    } finally {
      setLogging(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this log?")) return;
    const snapshot = logs;
    setLogs((prev) => prev.filter((l) => l.id !== id));
    const res = await fetch(`/api/meal-log/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setLogs(snapshot);
      toast.error("Couldn't delete");
    }
  }

  function startEdit(log: MealLogRow) {
    setEditingId(log.id);
    setEditTime(toDatetimeLocal(log.created_at));
  }

  async function saveEdit() {
    if (!editingId || !editTime) return;
    const newIso = new Date(editTime).toISOString();
    const snapshot = logs;
    setLogs((prev) =>
      sortLogs(prev.map((l) => (l.id === editingId ? { ...l, created_at: newIso } : l)))
    );
    setEditingId(null);

    const res = await fetch(`/api/meal-log/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ created_at: newIso }),
    });
    if (!res.ok) {
      setLogs(snapshot);
      toast.error("Couldn't update time");
    }
  }

  const grouped = groupByDay(logs);

  return (
    <Card>
      <CardContent className="pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Meal log
        </p>

        <div className="text-sm mb-4">
          <p className="text-xs text-muted-foreground">Last meal</p>
          <p className="font-medium">{lastMeal ? relativeTime(lastMeal.created_at) : "—"}</p>
        </div>

        {stayActive && (
          <Button
            variant="outline"
            onClick={handleLog}
            disabled={logging}
            className="h-12 w-full text-base mb-4"
          >
            🍽️ Log meal
          </Button>
        )}

        {logs.length > 0 ? (
          <div className="space-y-3">
            {grouped.map(({ label, entries }) => (
              <div key={label}>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
                <ul className="space-y-1">
                  {entries.map((log) => (
                    <li key={log.id} className="flex items-center gap-3 text-sm">
                      {editingId === log.id ? (
                        <Input
                          type="datetime-local"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="h-7 text-xs w-auto flex-1"
                        />
                      ) : (
                        <button
                          className="text-muted-foreground tabular-nums w-12 text-left hover:text-foreground hover:underline"
                          onClick={() => startEdit(log)}
                          title="Edit time"
                        >
                          {formatTime(log.created_at)}
                        </button>
                      )}
                      {editingId !== log.id && <span className="flex-1">🍽️ Fed</span>}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleDelete(log.id)}
                        title="Delete"
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No meals logged yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function sortLogs(logs: MealLogRow[]) {
  return [...logs].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function groupByDay(logs: MealLogRow[]) {
  const groups = new Map<string, MealLogRow[]>();
  for (const log of logs) {
    const label = dayLabel(log.created_at);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(log);
  }
  return Array.from(groups.entries()).map(([label, entries]) => ({ label, entries }));
}

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
