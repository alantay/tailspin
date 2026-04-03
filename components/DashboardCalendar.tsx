"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StayRow } from "@/lib/types";
import {
  buildCalendarGrid,
  buildWeekBars,
  assignColors,
  toDateString,
  STAY_COLORS,
  type WeekBar,
} from "@/lib/calendar-utils";

type Props = {
  stays: StayRow[];
};

const BAR_TOP = 24;    // px — space for day number
const BAR_H = 18;      // px — bar height
const BAR_GAP = 2;     // px — gap between lanes
const ROW_BOTTOM_PAD = 6; // px

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DashboardCalendar({ stays }: Props) {
  const [viewDate, setViewDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const viewEndStr = toDateString(new Date(year, month + 1, 0));

  const { grid, colorMap } = useMemo(() => {
    const grid = buildCalendarGrid(year, month);
    const colorMap = assignColors(stays, viewEndStr);
    return { grid, colorMap };
  }, [stays, year, month, viewEndStr]);

  function prevMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  return (
    <Card className="mb-6">
      <CardContent className="pt-4 pb-4 px-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="p-1 rounded-md hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h3 className="font-extrabold text-sm">{monthLabel}</h3>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="p-1 rounded-md hover:bg-secondary transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map(h => (
            <div
              key={h}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {h}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {grid.map((week, wi) => {
          const weekBars = buildWeekBars(week, stays, colorMap, viewEndStr);
          const numLanes = weekBars.length;
          const rowHeight = BAR_TOP + numLanes * (BAR_H + BAR_GAP) + ROW_BOTTOM_PAD;

          return (
            <div
              key={wi}
              className="relative grid grid-cols-7"
              style={{ minHeight: rowHeight }}
            >
              {/* Day number cells */}
              {week.map((day, di) => (
                <div
                  key={di}
                  className="text-right pr-1.5 pt-0.5"
                >
                  <span
                    className={[
                      "inline-flex items-center justify-center text-[11px] font-medium w-5 h-5 rounded-full",
                      !day.isCurrentMonth
                        ? "text-muted-foreground/40"
                        : day.isToday
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    {day.date.getDate()}
                  </span>
                </div>
              ))}

              {/* Bars overlay — percentage-based positioning */}
              <div className="absolute inset-0 pointer-events-none">
                {weekBars.map((laneBars: WeekBar[], laneIdx: number) =>
                  laneBars.map((bar: WeekBar) => {
                    const color = STAY_COLORS[bar.colorIndex % STAY_COLORS.length];
                    const top = BAR_TOP + laneIdx * (BAR_H + BAR_GAP);
                    const marginL = bar.isStart ? 2 : 0;
                    const marginR = bar.isEnd ? 2 : 0;
                    return (
                      <a
                        key={`${bar.stay.id}-${laneIdx}`}
                        href={`/dashboard/stay/${bar.stay.id}`}
                        className="pointer-events-auto overflow-hidden flex items-center px-1.5"
                        style={{
                          position: "absolute",
                          left: `calc(${(bar.startCol / 7) * 100}% + ${marginL}px)`,
                          width: `calc(${(bar.spanCols / 7) * 100}% - ${marginL}px - ${marginR}px)`,
                          top,
                          height: BAR_H,
                          background: color.bg,
                          color: color.text,
                          borderTopLeftRadius: bar.isStart ? 999 : 0,
                          borderBottomLeftRadius: bar.isStart ? 999 : 0,
                          borderTopRightRadius: bar.isEnd ? 999 : 0,
                          borderBottomRightRadius: bar.isEnd ? 999 : 0,
                          zIndex: 10,
                        }}
                      >
                        {bar.isStart && (
                          <span
                            className="text-[10px] font-semibold truncate leading-none"
                            style={{ color: color.text }}
                          >
                            {bar.stay.pet_name}
                          </span>
                        )}
                      </a>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
