import type { StayRow } from "@/lib/types";

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};


export const STAY_COLORS = [
  { bg: "oklch(0.88 0.10 32)",  text: "oklch(0.28 0.10 32)"  }, // coral
  { bg: "oklch(0.88 0.08 150)", text: "oklch(0.28 0.08 150)" }, // sage
  { bg: "oklch(0.88 0.08 250)", text: "oklch(0.28 0.08 250)" }, // sky
  { bg: "oklch(0.90 0.10 75)",  text: "oklch(0.28 0.10 75)"  }, // amber
  { bg: "oklch(0.88 0.08 340)", text: "oklch(0.28 0.08 340)" }, // dusty rose
  { bg: "oklch(0.88 0.08 200)", text: "oklch(0.28 0.08 200)" }, // teal
] as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function buildCalendarGrid(year: number, month: number): CalendarDay[][] {
  const todayStr = toDateString(new Date());
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPadding = firstOfMonth.getDay(); // 0 = Sunday

  const days: CalendarDay[] = [];

  // Pad with days from previous month
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false, isToday: toDateString(d) === todayStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({ date, isCurrentMonth: true, isToday: toDateString(date) === todayStr });
  }

  // Pad with days from next month to fill final week
  const remainder = days.length % 7;
  if (remainder !== 0) {
    const toAdd = 7 - remainder;
    for (let d = 1; d <= toAdd; d++) {
      const date = new Date(year, month + 1, d);
      days.push({ date, isCurrentMonth: false, isToday: toDateString(date) === todayStr });
    }
  }

  // Split into weeks
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function effectiveEnd(stay: StayRow, viewEndStr: string): string {
  return stay.end_date ?? viewEndStr;
}

function staysOverlap(a: StayRow, b: StayRow, viewEndStr: string): boolean {
  const aEnd = effectiveEnd(a, viewEndStr);
  const bEnd = effectiveEnd(b, viewEndStr);
  return a.start_date <= bEnd && b.start_date <= aEnd;
}

export function assignColors(stays: StayRow[], viewEndStr: string): Map<string, number> {
  const sorted = [...stays].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const colorMap = new Map<string, number>();

  for (const stay of sorted) {
    const usedColors = new Set<number>();
    for (const other of sorted) {
      if (other.id === stay.id) continue;
      if (!colorMap.has(other.id)) continue;
      if (staysOverlap(stay, other, viewEndStr)) {
        usedColors.add(colorMap.get(other.id)!);
      }
    }
    let colorIndex = 0;
    while (usedColors.has(colorIndex)) colorIndex++;
    colorMap.set(stay.id, colorIndex % STAY_COLORS.length);
  }

  return colorMap;
}

export function getStaysForDay(
  dayStr: string,
  stays: StayRow[],
  colorMap: Map<string, number>,
  viewEndStr: string
): Array<{ stay: StayRow; colorIndex: number }> {
  return stays
    .filter(s => s.start_date <= dayStr && effectiveEnd(s, viewEndStr) >= dayStr)
    .map(s => ({ stay: s, colorIndex: colorMap.get(s.id) ?? 0 }));
}

