"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToJpeg } from "@/lib/utils";
import UploadZone from "@/components/UploadZone";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StayRow, UploadRow } from "@/lib/types";

export default function StayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [stay, setStay] = useState<StayRow | null>(null);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [changingPhoto, setChangingPhoto] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const petPhotoInputRef = useRef<HTMLInputElement>(null);

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

  function handleDeleted(id: string) {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }

  function handleCaptionSaved(id: string, caption: string | null) {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, caption } : u))
    );
  }

  async function handlePetPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !stay) return;
    setChangingPhoto(true);
    try {
      const supabase = createClient();
      const resized = await resizeImageToJpeg(file, 800, 0.85);
      const path = `stays/${stay.id}/pet-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("stay-media")
        .upload(path, resized, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("stay-media").getPublicUrl(path);
      const { data } = await supabase
        .from("stays")
        .update({ pet_photo: urlData.publicUrl })
        .eq("id", stay.id)
        .select()
        .single();
      if (data) setStay(data);
    } finally {
      setChangingPhoto(false);
      if (petPhotoInputRef.current) petPhotoInputRef.current.value = "";
    }
  }

  function startEditing() {
    if (!stay) return;
    setEditName(stay.pet_name);
    setEditNote(stay.note ?? "");
    setEditStart(stay.start_date);
    setEditEnd(stay.end_date ?? "");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function handleSaveEdit() {
    if (!stay || !editName.trim()) return;
    setSavingEdit(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("stays")
      .update({
        pet_name: editName.trim(),
        note: editNote.trim() || null,
        start_date: editStart,
        end_date: editEnd || null,
      })
      .eq("id", stay.id)
      .select()
      .single();
    if (data) setStay(data);
    setSavingEdit(false);
    setEditing(false);
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

  async function handleMarkComplete() {
    if (!stay) return;
    setCompleting(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("stays")
      .update({ status: "completed" })
      .eq("id", stay.id)
      .select()
      .single();
    if (data) setStay(data);
    setCompleting(false);
  }

  if (loading) {
    return (
      <div className="mt-16 text-center text-muted-foreground">
        Fetching updates… (pun intended) 🐾
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="mt-16 text-center text-muted-foreground">
        Stay not found.
      </div>
    );
  }

  const startFormatted = new Date(stay.start_date).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const photoCount = uploads.filter((u) => u.type === "photo").length;
  const videoCount = uploads.filter((u) => u.type === "video").length;
  const mediaLabel = [
    photoCount > 0 ? `${photoCount} photo${photoCount !== 1 ? "s" : ""}` : "",
    videoCount > 0 ? `${videoCount} video${videoCount !== 1 ? "s" : ""}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Stay header */}
      <Card>
        <CardContent className="pt-5">
          {editing ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  className="relative group shrink-0"
                  onClick={() => petPhotoInputRef.current?.click()}
                  disabled={changingPhoto}
                  title="Change pet photo"
                >
                  <Avatar className="h-12 w-12">
                    {stay.pet_photo && (
                      <AvatarImage src={stay.pet_photo} alt={stay.pet_name} />
                    )}
                    <AvatarFallback className="bg-accent text-xl">🐾</AvatarFallback>
                  </Avatar>
                  <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100">
                    {changingPhoto ? "…" : "Edit"}
                  </span>
                </button>
                <input
                  ref={petPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePetPhotoChange}
                />
                <div className="flex-1">
                  <Label htmlFor="editName">Pet name</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="editNote">Boarding notes (optional)</Label>
                <Textarea
                  id="editNote"
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="What should the owner bring? (medication, favourite toys, food preferences…)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="editStart">Start date</Label>
                  <Input
                    id="editStart"
                    type="date"
                    required
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="editEnd">End date (optional)</Label>
                  <Input
                    id="editEnd"
                    type="date"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={savingEdit || !editName.trim()} className="flex-1">
                  {savingEdit ? "Saving…" : "Save changes"}
                </Button>
                <Button variant="outline" onClick={cancelEditing} disabled={savingEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    className="relative group shrink-0"
                    onClick={() => petPhotoInputRef.current?.click()}
                    disabled={changingPhoto}
                    title="Change pet photo"
                  >
                    <Avatar className="h-12 w-12">
                      {stay.pet_photo && (
                        <AvatarImage src={stay.pet_photo} alt={stay.pet_name} />
                      )}
                      <AvatarFallback className="bg-accent text-xl">🐾</AvatarFallback>
                    </Avatar>
                    <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100">
                      {changingPhoto ? "…" : "Edit"}
                    </span>
                  </button>
                  <input
                    ref={petPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePetPhotoChange}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold">{stay.pet_name}</h2>
                      <Badge variant={stay.status === "active" ? "default" : "secondary"}>
                        {stay.status === "active" ? "Active" : "Done"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{startFormatted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={startEditing}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    {copied ? "Link copied! ✓" : "Share link"}
                  </Button>
                </div>
              </div>

              {stay.note && (
                <div className="mt-4 border-l-4 border-primary/30 pl-4 py-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Boarding notes
                  </p>
                  <p className="text-sm">{stay.note}</p>
                </div>
              )}

              {stay.status === "active" && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={completing}
                    onClick={handleMarkComplete}
                  >
                    {completing ? "Wrapping up…" : "Mark as complete"}
                  </Button>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    That&apos;s a wrap! Another tail well told 🐾
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload section — only for active stays */}
      {stay.status === "active" && (
        <Card>
          <CardContent className="pt-5">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Add photos &amp; videos
            </p>
            <UploadZone stayId={stay.id} onUploaded={handleUploaded} />
          </CardContent>
        </Card>
      )}

      {/* Media feed */}
      {uploads.length > 0 ? (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {mediaLabel || "Media"}
          </p>
          <div className="flex flex-col gap-4">
            {uploads.map((upload) => (
              <MediaCard
                key={upload.id}
                upload={upload}
                petName={stay.pet_name}
                onDeleted={handleDeleted}
                onCaptionSaved={handleCaptionSaved}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-3xl mb-2">📸</p>
          <p className="text-sm">No photos yet. Upload the first one above!</p>
        </div>
      )}
    </div>
  );
}
