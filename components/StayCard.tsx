"use client";

import type { StayRow } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink, Share2 } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  stay: StayRow;
  uploads?: { type: string; created_at: string }[];
};

export default function StayCard({ stay, uploads = [] }: Props) {
  async function handleShare() {
    const url = `${window.location.origin}/stay/${stay.share_token}`;
    if (navigator.share) {
      await navigator.share({ title: `${stay.pet_name}'s stay`, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
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
          <Avatar className="!size-14">
            {stay.pet_photo && <AvatarImage src={stay.pet_photo} alt={stay.pet_name} />}
            <AvatarFallback className="bg-accent text-2xl">
              🐾
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-extrabold">{stay.pet_name}</p>
            {stay.owner_name && (
              <p className="text-xs font-medium text-foreground/70">{stay.owner_name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {startFormatted}{endFormatted ? ` – ${endFormatted}` : ""}
            </p>
            {uploads.length > 0 && (() => {
              const photos = uploads.filter(u => u.type === "photo").length;
              const videos = uploads.filter(u => u.type === "video").length;
              const parts = [
                photos > 0 ? `${photos} photo${photos !== 1 ? "s" : ""}` : "",
                videos > 0 ? `${videos} video${videos !== 1 ? "s" : ""}` : "",
              ].filter(Boolean).join(" · ");
              const latest = uploads.reduce((a, b) => a.created_at > b.created_at ? a : b);
              const latestIso = latest.created_at?.replace(" ", "T");
              const timeLabel = latestIso && !isNaN(new Date(latestIso).getTime())
                ? relativeTime(latestIso)
                : null;
              return (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {parts}{timeLabel ? ` · ${timeLabel}` : ""}
                </p>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={stay.status === "active" ? "default" : "secondary"}>
            {stay.status === "active" ? "Active" : "Done"}
          </Badge>
          <a
            href={`/dashboard/stay/${stay.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
