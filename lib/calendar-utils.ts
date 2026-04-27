import type { StayRow } from "@/lib/types";

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export type WeekBar = {
  stay: StayRow;
  colorIndex: number;
  startCol: number;
  spanCols: number;
  isStart: boolean;
  isEnd: boolean;
  lane: number;
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

export function buildWeekBars(
  week: CalendarDay[],
  stays: StayRow[],
  colorMap: Map<string, number>,
  viewEndStr: string
): WeekBar[][] {
  const weekDates = week.map(d => toDateString(d.date));
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Find the first and last current-month column explicitly
  let firstCMCol = -1;
  let lastCMCol = -1;
  for (let i = 0; i < 7; i++) {
    if (week[i].isCurrentMonth) {
      if (firstCMCol === -1) firstCMCol = i;
      lastCMCol = i;
    }
  }
  if (firstCMCol === -1) return [];

  const bars: Omit<WeekBar, "lane">[] = [];

  for (const stay of stays) {
    const end = effectiveEnd(stay, viewEndStr);

    // Skip stays that don't overlap this week at all
    if (stay.start_date > weekEnd || end < weekStart) continue;

    // Raw column: use -1 sentinel if before week, 7 if after week
    const rawStartCol = stay.start_date < weekStart
      ? -1
      : weekDates.indexOf(stay.start_date);
    const rawEndCol = end > weekEnd
      ? 7
      : weekDates.indexOf(end);

    // Map to visible CM columns
    const startCol = Math.max(rawStartCol === -1 ? 0 : rawStartCol, firstCMCol);
    const endCol = Math.min(rawEndCol === 7 ? 6 : rawEndCol, lastCMCol);
    if (endCol < startCol) continue;

    bars.push({
      stay,
      colorIndex: colorMap.get(stay.id) ?? 0,
      startCol,
      spanCols: endCol - startCol + 1,
      isStart: rawStartCol >= firstCMCol,  // stay begins within CM portion of this week
      isEnd: rawEndCol <= lastCMCol,       // stay ends within CM portion of this week
    });
  }

  // Assign lanes (pack greedily by column range)
  const laneOccupancy: Array<[number, number][]> = []; // lane → list of [startCol, endCol]
  const barsWithLane: WeekBar[] = [];

  for (const bar of bars) {
    let lane = 0;
    while (true) {
      if (!laneOccupancy[lane]) laneOccupancy[lane] = [];
      const occupied = laneOccupancy[lane].some(
        ([s, e]) => !(bar.startCol > e || bar.startCol + bar.spanCols - 1 < s)
      );
      if (!occupied) break;
      lane++;
    }
    laneOccupancy[lane].push([bar.startCol, bar.startCol + bar.spanCols - 1]);
    barsWithLane.push({ ...bar, lane });
  }

  // Group by lane
  const maxLane = barsWithLane.reduce((m, b) => Math.max(m, b.lane), -1);
  const byLane: WeekBar[][] = Array.from({ length: maxLane + 1 }, () => []);
  for (const bar of barsWithLane) {
    byLane[bar.lane].push(bar);
  }
  return byLane;
}

export function maxLanesInWeek(weekBars: WeekBar[][]): number {
  return weekBars.length;
}
