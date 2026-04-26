"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { MealLogRow, PottyLogRow } from "@/lib/types";

interface Props {
  stayId: string;
  onMealLogged: (log: MealLogRow) => void;
  onPottyLogged: (log: PottyLogRow) => void;
}

export default function QuickLogRow({ stayId, onMealLogged, onPottyLogged }: Props) {
  const [logging, setLogging] = useState<string | null>(null);

  async function logMeal() {
    if (logging) return;
    setLogging("meal");
    const res = await fetch("/api/meal-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stay_id: stayId }),
    });
    if (res.ok) {
      const log: MealLogRow = await res.json();
      onMealLogged(log);
      toast.success("Meal logged 🍽️");
    } else {
      toast.error("Failed to log meal");
    }
    setLogging(null);
  }

  async function logPotty(type: "pee" | "poop") {
    if (logging) return;
    setLogging(type);
    const res = await fetch("/api/potty-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stay_id: stayId, type }),
    });
    if (res.ok) {
      const log: PottyLogRow = await res.json();
      onPottyLogged(log);
      toast.success(type === "pee" ? "Pee logged 💧" : "Poop logged 💩");
    } else {
      toast.error("Failed to log");
    }
    setLogging(null);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={logMeal}
        disabled={!!logging}
        style={{ background: "var(--bar-amber-bg)", color: "var(--bar-amber-text)" }}
        className="h-9 px-4 rounded-full text-sm font-semibold disabled:opacity-50 transition-opacity"
      >
        🍽️ {logging === "meal" ? "Logging…" : "Meal"}
      </button>
      <button
        onClick={() => logPotty("pee")}
        disabled={!!logging}
        style={{ background: "var(--bar-sage-bg)", color: "var(--bar-sage-text)" }}
        className="h-9 px-4 rounded-full text-sm font-semibold disabled:opacity-50 transition-opacity"
      >
        💧 {logging === "pee" ? "Logging…" : "Pee"}
      </button>
      <button
        onClick={() => logPotty("poop")}
        disabled={!!logging}
        style={{ background: "var(--bar-rose-bg)", color: "var(--bar-rose-text)" }}
        className="h-9 px-4 rounded-full text-sm font-semibold disabled:opacity-50 transition-opacity"
      >
        💩 {logging === "poop" ? "Logging…" : "Poop"}
      </button>
    </div>
  );
}
