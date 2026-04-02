"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
      setLastRefreshed(new Date());
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isPending}
      >
        {isPending ? "Checking for new photos… 🐾" : "Check for new photos"}
      </Button>
      {lastRefreshed && !isPending && (
        <p className="text-xs text-muted-foreground">
          Last checked at {lastRefreshed.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}
