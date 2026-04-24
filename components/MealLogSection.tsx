"use client";

import { useState } from "react";
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
};

export default function MealLogSection({ stayId, initialLogs, stayActive }: Props) {
  const [logs, setLogs] = useState(initialLogs);
  const [logging, setLogging] = useState(false);
  const [foodInput, setFoodInput] = useState("");

  const lastMeal = logs[0];

  async function handleLog() {
    const food = foodInput.trim() || null;
    setLogging(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: MealLogRow = {
      id: tempId,
      stay_id: stayId,
      food,
      created_at: new Date().toISOString(),
    };
    setLogs((prev) => [optimistic, ...prev]);
    setFoodInput("");

    try {
      const res = await fetch("/api/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stay_id: stayId, food }),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved: MealLogRow = await res.json();
      setLogs((prev) => prev.map((l) => (l.id === tempId ? saved : l)));
    } catch {
      setLogs((prev) => prev.filter((l) => l.id !== tempId));
      setFoodInput(food ?? "");
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

  const grouped = groupByDay(logs);

  return (
    <Card>
      <CardContent className="pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Meal log
        </p>

        <div className="text-sm mb-4">
          <p className="text-xs text-muted-foreground">Last meal</p>
          <p className="font-medium">
            {lastMeal ? (
              <>
                {relativeTime(lastMeal.created_at)}
                {lastMeal.food && <span className="text-muted-foreground font-normal"> · {lastMeal.food}</span>}
              </>
            ) : (
              "—"
            )}
          </p>
        </div>

        {stayActive && (
          <div className="flex gap-2 mb-4">
            <Input
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              placeholder="what they ate? (optional)"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !logging) {
                  e.preventDefault();
                  handleLog();
                }
              }}
              disabled={logging}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleLog}
              disabled={logging}
              className="h-10 shrink-0"
            >
              🍽️ Log meal
            </Button>
          </div>
        )}

        {logs.length > 0 ? (
          <div className="space-y-3">
            {grouped.map(({ label, entries }) => (
              <div key={label}>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
                <ul className="space-y-1">
                  {entries.map((log) => (
                    <li key={log.id} className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground tabular-nums w-12">
                        {formatTime(log.created_at)}
                      </span>
                      <span className="flex-1 min-w-0 truncate">
                        🍽️ {log.food || <span className="text-muted-foreground">Fed</span>}
                      </span>
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
