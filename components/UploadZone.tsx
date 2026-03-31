"use client";

import { useRef, useState } from "react";
import { resizeImageToJpeg } from "@/lib/utils";
import type { UploadRow } from "@/lib/types";

type UploadState = {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

type Props = {
  stayId: string;
  onUploaded: (upload: UploadRow) => void;
};

export default function UploadZone({ stayId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [queue, setQueue] = useState<UploadState[]>([]);

  function updateStatus(
    index: number,
    status: UploadState["status"],
    error?: string
  ) {
    setQueue((prev) =>
      prev.map((item, i) => (i === index ? { ...item, status, error } : item))
    );
  }

  async function uploadFile(file: File, index: number) {
    updateStatus(index, "uploading");
    try {
      const resized = await resizeImageToJpeg(file, 1920, 0.8);
      const filename = `${crypto.randomUUID()}.jpg`;

      const res = await fetch(
        `/api/upload?stay_id=${stayId}&filename=${filename}`
      );
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { path, signedUrl } = await res.json();

      const putRes = await fetch(signedUrl, {
        method: "PUT",
        body: resized,
        headers: { "Content-Type": "image/jpeg" },
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");

      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stay_id: stayId, path, caption }),
      });
      if (!confirmRes.ok) throw new Error("Failed to save upload record");

      const upload: UploadRow = await confirmRes.json();
      onUploaded(upload);
      updateStatus(index, "done");
    } catch (err) {
      updateStatus(
        index,
        "error",
        err instanceof Error ? err.message : "Upload failed"
      );
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: UploadState[] = Array.from(files).map((file) => ({
      file,
      status: "pending",
    }));
    const startIndex = queue.length;
    setQueue((prev) => [...prev, ...newItems]);
    for (let i = 0; i < newItems.length; i++) {
      await uploadFile(newItems[i].file, startIndex + i);
    }
    setCaption("");
  }

  const active = queue.filter(
    (q) => q.status === "pending" || q.status === "uploading"
  );
  const errors = queue.filter((q) => q.status === "error");

  return (
    <div>
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium" htmlFor="caption">
          Caption (optional — applies to all selected photos)
        </label>
        <input
          id="caption"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption…"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={active.length > 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-8 text-sm font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-50"
      >
        {active.length > 0 ? (
          <span>Uploading {active.length} photo{active.length !== 1 ? "s" : ""}…</span>
        ) : (
          <span>Tap to add photos from camera roll</span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-red-500">
              {e.file.name}: {e.error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
