"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateShareToken, resizeImageToJpeg } from "@/lib/utils";

export default function NewStayPage() {
  const router = useRouter();
  const [petName, setPetName] = useState("");
  const [note, setNote] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState("");
  const [petPhotoFile, setPetPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const share_token = generateShareToken();

      const { data: stay, error: stayError } = await supabase
        .from("stays")
        .insert({
          boarder_id: user.id,
          pet_name: petName,
          note: note || null,
          start_date: startDate,
          end_date: endDate || null,
          status: "active",
          share_token,
        })
        .select("id")
        .single();

      if (stayError) throw stayError;

      if (petPhotoFile) {
        const resized = await resizeImageToJpeg(petPhotoFile, 800, 0.85);
        const path = `stays/${stay.id}/pet.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("stay-media")
          .upload(path, resized, { contentType: "image/jpeg", upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("stay-media")
            .getPublicUrl(path);
          await supabase
            .from("stays")
            .update({ pet_photo: urlData.publicUrl })
            .eq("id", stay.id);
        }
      }

      router.push(`/dashboard/stay/${stay.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">New stay</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="petName">
            Pet name <span className="text-red-400">*</span>
          </label>
          <input
            id="petName"
            type="text"
            required
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Biscuit"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="petPhoto"
          >
            Pet photo (optional)
          </label>
          <input
            id="petPhoto"
            type="file"
            accept="image/*"
            onChange={(e) => setPetPhotoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-medium"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="note">
            Note (optional)
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Any details about the pet or stay…"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="startDate"
            >
              Start date <span className="text-red-400">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="endDate"
            >
              End date (optional)
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create stay"}
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
