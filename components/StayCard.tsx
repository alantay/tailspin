"use client";

import { useState } from "react";
import type { StayRow } from "@/lib/types";

type Props = {
  stay: StayRow;
};

export default function StayCard({ stay }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/stay/${stay.share_token}`
      : `/stay/${stay.share_token}`;

  async function handleShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/stay/${stay.share_token}`
        : `/stay/${stay.share_token}`;

    if (navigator.share) {
      await navigator.share({ title: `${stay.pet_name}'s stay`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const formattedDate = new Date(stay.start_date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-4">
      <div>
        <p className="font-medium">{stay.pet_name}</p>
        <p className="mt-0.5 text-sm text-neutral-500">
          {formattedDate}
          {stay.end_date
            ? ` – ${new Date(stay.end_date).toLocaleDateString("en", { month: "short", day: "numeric" })}`
            : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            stay.status === "active"
              ? "bg-green-50 text-green-700"
              : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {stay.status}
        </span>
        <a
          href={`/dashboard/stay/${stay.id}`}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
        >
          Open
        </a>
        <button
          onClick={handleShare}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
        >
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}
