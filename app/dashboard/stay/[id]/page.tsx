"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import UploadZone from "@/components/UploadZone";
import type { StayRow, UploadRow } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

export default function StayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [stay, setStay] = useState<StayRow | null>(null);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: stayData }, { data: uploadsData }] = await Promise.all([
        supabase.from("stays").select("*").eq("id", id).single(),
        supabase
          .from("uploads")
          .select("*")
          .eq("stay_id", id)
          .order("created_at", { ascending: false }),
      ]);
      setStay(stayData);
      setUploads(uploadsData ?? []);
      setLoading(false);
    })();
  }, [id]);

  function handleUploaded(upload: UploadRow) {
    setUploads((prev) => [upload, ...prev]);
  }

  async function handleShare() {
    if (!stay) return;
    const url = `${window.location.origin}/stay/${stay.share_token}`;
    if (navigator.share) {
      await navigator.share({ title: `${stay.pet_name}'s stay`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return <div className="text-neutral-400">Loading…</div>;
  }

  if (!stay) {
    return <div className="text-neutral-400">Stay not found.</div>;
  }

  const formattedDate = new Date(stay.start_date).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* Stay header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {stay.pet_photo && (
            <Image
              src={stay.pet_photo}
              alt={stay.pet_name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{stay.pet_name}</h2>
            <p className="text-sm text-neutral-500">{formattedDate}</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
        >
          {copied ? "Link copied!" : "Share link"}
        </button>
      </div>

      {stay.note && (
        <p className="mt-3 rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600">
          {stay.note}
        </p>
      )}

      {/* Upload section */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Add photos
        </h3>
        <UploadZone stayId={stay.id} onUploaded={handleUploaded} />
      </div>

      {/* Photo feed */}
      {uploads.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">
            {uploads.length} photo{uploads.length !== 1 ? "s" : ""}
          </h3>
          <div className="flex flex-col gap-4">
            {uploads.map((upload) => (
              <div key={upload.id} className="overflow-hidden rounded-xl">
                <Image
                  src={upload.file_url}
                  alt={upload.caption ?? stay.pet_name}
                  width={800}
                  height={600}
                  className="w-full object-cover"
                />
                <div className="flex items-center justify-between px-1 pt-2">
                  {upload.caption && (
                    <p className="text-sm text-neutral-700">{upload.caption}</p>
                  )}
                  <p className="ml-auto text-xs text-neutral-400">
                    {relativeTime(upload.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploads.length === 0 && (
        <p className="mt-8 text-center text-sm text-neutral-400">
          No photos yet. Upload the first one above.
        </p>
      )}
    </div>
  );
}
