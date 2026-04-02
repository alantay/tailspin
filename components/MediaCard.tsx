"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UploadRow } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

type Props = {
  upload: UploadRow;
  petName: string;
  /** If undefined, no edit/delete controls are shown (owner view) */
  onDeleted?: (id: string) => void;
  onCaptionSaved?: (id: string, caption: string | null) => void;
};

export default function MediaCard({
  upload,
  petName,
  onDeleted,
  onCaptionSaved,
}: Props) {
  const [caption, setCaption] = useState(upload.caption ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditable = !!onDeleted; // show controls only in boarder view

  async function handleSaveCaption() {
    if (!onCaptionSaved) return;
    setSaving(true);
    const res = await fetch(`/api/uploads/${upload.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption }),
    });
    if (res.ok) {
      onCaptionSaved(upload.id, caption || null);
    }
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!onDeleted) return;
    if (!confirm(`Delete this ${upload.type}?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/uploads/${upload.id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted(upload.id);
    } else {
      setDeleting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSaveCaption();
    if (e.key === "Escape") {
      setCaption(upload.caption ?? "");
      setEditing(false);
    }
  }

  return (
    <Card className={`overflow-hidden animate-in fade-in duration-500 ${deleting ? "opacity-50" : ""}`}>
      {upload.type === "video" ? (
        <video src={upload.file_url} controls playsInline className="w-full" />
      ) : (
        <Image
          src={upload.file_url}
          alt={upload.caption ?? petName}
          width={800}
          height={600}
          className="w-full object-cover"
          loading="lazy"
        />
      )}

      <CardContent className="py-3">
        <div className="flex items-start gap-2">
          {/* Caption area */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveCaption}
                autoFocus
                placeholder="Add a caption…"
                className="w-full text-sm bg-transparent border-b border-border outline-none pb-0.5"
              />
            ) : (
              <p
                className={`text-sm ${isEditable ? "cursor-text hover:text-foreground" : ""} ${!caption ? "text-muted-foreground italic" : ""}`}
                onClick={() => {
                  if (isEditable) {
                    setEditing(true);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }
                }}
              >
                {caption || (isEditable ? "Add a caption…" : "")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <p className="text-xs text-muted-foreground">
              {relativeTime(upload.created_at)}
            </p>
            {isEditable && !editing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete"
              >
                ×
              </Button>
            )}
            {editing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs"
                onClick={handleSaveCaption}
                disabled={saving}
              >
                {saving ? "…" : "Save"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
