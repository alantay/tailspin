"use client";

import { useRef, useState } from "react";
import { resizeImageToJpeg } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { UploadRow } from "@/lib/types";

const MAX_VIDEO_SECONDS = 35;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

type FileStatus = "pending" | "compressing" | "uploading" | "done" | "error";

type FileEntry = {
  file: File;
  type: "photo" | "video";
  status: FileStatus;
  progress: number; // 0–100
  error?: string;
};

type Props = {
  stayId: string;
  onUploaded: (upload: UploadRow) => void;
};

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video file"));
    };
    video.src = url;
  });
}

function uploadToStorage(
  supabaseUrl: string,
  accessToken: string,
  path: string,
  body: Blob,
  contentType: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    // POST directly to Supabase Storage REST API — works for all file types
    xhr.open(
      "POST",
      `${supabaseUrl}/storage/v1/object/stay-media/${path}`
    );
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.send(body);
  });
}

export default function UploadZone({ stayId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<FileEntry[]>([]);

  function updateEntry(index: number, patch: Partial<FileEntry>) {
    setQueue((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  async function processFile(
    file: File,
    type: "photo" | "video",
    index: number
  ) {
    try {
      let body: Blob;
      let contentType: string;
      let ext: string;

      if (type === "video") {
        updateEntry(index, { status: "compressing" }); // validation step
        const duration = await getVideoDuration(file);
        if (duration > MAX_VIDEO_SECONDS) {
          throw new Error(
            `Video is ${Math.round(duration)}s — max ${MAX_VIDEO_SECONDS}s allowed`
          );
        }
        if (file.size > MAX_VIDEO_BYTES) {
          throw new Error(
            `Video is ${Math.round(file.size / 1024 / 1024)}MB — max 50MB allowed`
          );
        }
        body = file;
        contentType = file.type || "video/mp4";
        ext = file.name.split(".").pop() ?? "mp4";
      } else {
        updateEntry(index, { status: "compressing" });
        body = await resizeImageToJpeg(file, 1920, 0.8);
        contentType = "image/jpeg";
        ext = "jpg";
      }

      const filename = `${crypto.randomUUID()}.${ext}`;

      // Validate ownership server-side, get storage path
      const res = await fetch(
        `/api/upload?stay_id=${stayId}&filename=${filename}`
      );
      if (!res.ok) throw new Error("Failed to validate upload");
      const { path } = await res.json();

      // Get session token for direct storage upload
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Upload directly to Supabase Storage REST API via XHR (progress tracking)
      updateEntry(index, { status: "uploading", progress: 0 });
      await uploadToStorage(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        session.access_token,
        path,
        body,
        contentType,
        (pct) => updateEntry(index, { progress: pct })
      );

      // Record in DB
      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stay_id: stayId,
          path,
          type,
          caption: null,
        }),
      });
      if (!confirmRes.ok) throw new Error("Failed to save upload record");

      const upload: UploadRow = await confirmRes.json();
      onUploaded(upload);
      updateEntry(index, { status: "done", progress: 100 });
    } catch (err) {
      updateEntry(index, {
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newEntries: FileEntry[] = Array.from(files).map((file) => ({
      file,
      type: file.type.startsWith("video/") ? "video" : "photo",
      status: "pending",
      progress: 0,
    }));

    const startIndex = queue.length;
    setQueue((prev) => [...prev, ...newEntries]);

    // Reset file input so same files can be re-selected after error
    if (inputRef.current) inputRef.current.value = "";

    for (let i = 0; i < newEntries.length; i++) {
      await processFile(
        newEntries[i].file,
        newEntries[i].type,
        startIndex + i
      );
    }
  }

  const active = queue.filter(
    (q) => q.status === "pending" || q.status === "compressing" || q.status === "uploading"
  );
  const errors = queue.filter((q) => q.status === "error");

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-24 border-dashed border-2 text-muted-foreground hover:text-foreground flex-col gap-1"
        onClick={() => inputRef.current?.click()}
        disabled={active.length > 0}
      >
        {active.length > 0 ? (
          <span className="text-sm">
            Uploading {active.length} file{active.length !== 1 ? "s" : ""}… 🐾
          </span>
        ) : (
          <>
            <span className="text-sm font-medium">Tap to add photos or videos 📷</span>
            <span className="text-xs opacity-60">Photos & videos up to 35s</span>
          </>
        )}
      </Button>

      {/* Per-file progress */}
      {active.length > 0 && (
        <div className="space-y-2">
          {queue
            .map((entry, i) => ({ entry, i }))
            .filter(({ entry }) =>
              entry.status === "compressing" || entry.status === "uploading"
            )
            .map(({ entry, i }) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="truncate max-w-[70%]">{entry.file.name}</span>
                  <span>
                    {entry.status === "compressing"
                      ? entry.type === "video"
                        ? "Checking…"
                        : "Compressing…"
                      : `${entry.progress}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-200"
                    style={{
                      width:
                        entry.status === "compressing"
                          ? "10%"
                          : `${entry.progress}%`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {errors.length > 0 && (
        <div className="space-y-1 pt-1">
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-destructive">
              {e.file.name}: {e.error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
