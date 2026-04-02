"use client";

import { useState } from "react";
import type { StayRow } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  stay: StayRow;
};

export default function StayCard({ stay }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/stay/${stay.share_token}`;
    if (navigator.share) {
      await navigator.share({ title: `${stay.pet_name}'s stay`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const startFormatted = new Date(stay.start_date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
  const endFormatted = stay.end_date
    ? new Date(stay.end_date).toLocaleDateString("en", { month: "short", day: "numeric" })
    : null;

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar>
            {stay.pet_photo && <AvatarImage src={stay.pet_photo} alt={stay.pet_name} />}
            <AvatarFallback className="bg-accent text-lg">
              🐾
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{stay.pet_name}</p>
            <p className="text-sm text-muted-foreground">
              {startFormatted}{endFormatted ? ` – ${endFormatted}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={stay.status === "active" ? "default" : "secondary"}>
            {stay.status === "active" ? "Active" : "Done"}
          </Badge>
          <a
            href={`/dashboard/stay/${stay.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Open
          </a>
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? "Copied! ✓" : "Share"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
