"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Download, X, Maximize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UploadRow } from "@/lib/types";
import { relativeTime } from "@/lib/utils";
import { toast } from "sonner";

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
  const [downloading, setDownloading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditable = !!onDeleted; // show controls only in boarder view

  // Escape to close + body scroll lock
  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen]);

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

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(upload.file_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${petName}-${upload.id}.${upload.type === "video" ? "mp4" : "jpg"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Saved!");
    } finally {
      setDownloading(false);
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
    <>
      <Card className={`overflow-hidden animate-in fade-in duration-500 ${deleting ? "opacity-50" : ""}`}>
        {upload.type === "video" ? (
          <div className="relative">
            <video src={upload.file_url} controls playsInline className="w-full" />
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-md p-1.5 transition-colors"
              title="View fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLightboxOpen(true)}
            className="w-full cursor-zoom-in block"
            aria-label="View full size"
          >
            <Image
              src={upload.file_url}
              alt={upload.caption ?? petName}
              width={800}
              height={600}
              className="w-full object-cover"
              loading="lazy"
            />
          </button>
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
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleDownload}
                  disabled={downloading}
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              )}
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

      {/* Lightbox */}
      {lightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Media — stop propagation so clicking media doesn't close */}
          <div
            className="flex flex-col items-center gap-3 max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {upload.type === "video" ? (
              <video
                src={upload.file_url}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] max-w-[90vw] rounded-lg"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={upload.file_url}
                alt={caption || petName}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
              />
            )}

            {/* Caption + download */}
            <div className="flex items-center gap-4 text-sm">
              {caption && <span className="text-white/80">{caption}</span>}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                {downloading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
