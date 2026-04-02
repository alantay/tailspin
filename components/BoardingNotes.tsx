"use client";

import { useState } from "react";

type Props = {
  note: string;
  startDate: string;
};

export default function BoardingNotes({ note, startDate }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const boardingStarted = today >= startDate;
  const [open, setOpen] = useState(!boardingStarted);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 w-full text-left border-l-4 border-primary/30 pl-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        View boarding notes ›
      </button>
    );
  }

  return (
    <div className="mb-6 border-l-4 border-primary/30 pl-4 py-1">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Boarding notes
        </p>
        {boardingStarted && (
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Hide
          </button>
        )}
      </div>
      <p className="text-sm">{note}</p>
    </div>
  );
}
