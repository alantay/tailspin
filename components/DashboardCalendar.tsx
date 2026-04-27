"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StayRow } from "@/lib/types";
import {
  buildCalendarGrid,
  assignColors,
  getStaysForDay,
  toDateString,
  STAY_COLORS,
} from "@/lib/calendar-utils";

type Props = {
  stays: StayRow[];
};

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
        <div className="grid grid-cols-7 border-l border-t border-border/30">
          {DAY_HEADERS.map(h => (
            <div
              key={h}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-1 border-r border-b border-border/30"
            >
              {h}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="border-l border-border/30">
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const dayStr = toDateString(day.date);
                const dayStays = day.isCurrentMonth
                  ? getStaysForDay(dayStr, stays, colorMap, viewEndStr)
                  : [];

                return (
                  <div
                    key={di}
                    className="flex flex-col items-center pt-1.5 pb-2 gap-1 border-r border-b border-border/30"
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

                    {/* Dots row — fixed height so all cells are uniform */}
                    <div className="flex gap-0.5 h-2 items-center">
                      {dayStays.map(({ stay, colorIndex }) => (
                        <a
                          key={stay.id}
                          href={`/dashboard/stay/${stay.id}`}
                          title={stay.pet_name}
                          className="w-1.5 h-1.5 rounded-full shrink-0 hover:scale-125 transition-transform"
                          style={{ background: STAY_COLORS[colorIndex % STAY_COLORS.length].bg }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
