"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Pencil, Share2, Trash2, CheckCircle, Lock } from "lucide-react";
import type { StayRow, UploadRow } from "@/lib/types";
import { toast } from "sonner";

type StayNote = { id: string; content: string; updated_at: string } | null;

export default function StayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [stay, setStay] = useState<StayRow | null>(null);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [changingPhoto, setChangingPhoto] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinnedNote, setPinnedNote] = useState<StayNote>(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const petPhotoInputRef = useRef<HTMLInputElement>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: stayData }, { data: uploadsData }, { data: noteData }] = await Promise.all([
        supabase.from("stays").select("*").eq("id", id).single(),
        supabase
          .from("uploads")
          .select("*")
          .eq("stay_id", id)
          .order("created_at", { ascending: false }),
        supabase.from("stay_notes").select("*").eq("stay_id", id).maybeSingle(),
      ]);
      setStay(stayData);
      setUploads(uploadsData ?? []);
      setPinnedNote(noteData);
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
    setEditOwnerName(stay.owner_name ?? "");
    setEditPhoneNumber(stay.phone_number ?? "");
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
        owner_name: editOwnerName.trim() || null,
        phone_number: editPhoneNumber.trim() || null,
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
      toast.success("Link copied!");
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
    setConfirmComplete(false);
  }

  async function handleReactivate() {
    if (!stay) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("stays")
      .update({ status: "active" })
      .eq("id", stay.id)
      .select()
      .single();
    if (data) setStay(data);
  }

  function startEditingNote() {
    setNoteContent(pinnedNote?.content ?? "");
    setEditingNote(true);
    setTimeout(() => noteTextareaRef.current?.focus(), 0);
  }

  function cancelEditingNote() {
    setEditingNote(false);
  }

  async function handleSaveNote() {
    setSavingNote(true);
    const supabase = createClient();
    if (pinnedNote) {
      const { data } = await supabase
        .from("stay_notes")
        .update({ content: noteContent, updated_at: new Date().toISOString() })
        .eq("id", pinnedNote.id)
        .select()
        .single();
      if (data) setPinnedNote(data);
    } else {
      const { data } = await supabase
        .from("stay_notes")
        .insert({ stay_id: id, content: noteContent })
        .select()
        .single();
      if (data) setPinnedNote(data);
    }
    setSavingNote(false);
    setEditingNote(false);
  }

  function handleNoteKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSaveNote();
    if (e.key === "Escape") cancelEditingNote();
  }

  async function handleDelete() {
    if (!stay) return;
    setDeleting(true);
    const supabase = createClient();
    // Remove all storage files for this stay (best effort)
    const { data: files } = await supabase.storage.from("stay-media").list(`stays/${stay.id}`);
    if (files && files.length > 0) {
      await supabase.storage
        .from("stay-media")
        .remove(files.map((f) => `stays/${stay.id}/${f.name}`));
    }
    await supabase.from("stays").delete().eq("id", stay.id);
    router.push("/dashboard");
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
                <Label htmlFor="editOwnerName">Owner name <span className="text-destructive">*</span></Label>
                <Input
                  id="editOwnerName"
                  required
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="editPhoneNumber">Owner phone (optional)</Label>
                <Input
                  id="editPhoneNumber"
                  type="tel"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  placeholder="+65 9123 4567"
                />
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
                <Button onClick={handleSaveEdit} disabled={savingEdit || !editName.trim() || !editOwnerName.trim()} className="flex-1">
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
                    {stay.owner_name && (
                      <p className="text-xs font-medium text-foreground/70">{stay.owner_name}{stay.phone_number ? ` · ${stay.phone_number}` : ""}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{startFormatted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={startEditing} className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
                    <Share2 className="h-3.5 w-3.5" />
                    Share link
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
                  {confirmComplete ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Mark this stay as complete?</p>
                      <Button
                        size="sm"
                        disabled={completing}
                        onClick={handleMarkComplete}
                        className="gap-1.5"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {completing ? "Wrapping up…" : "Yes, complete"}
                      </Button>
                      <Button variant="outline" size="sm" disabled={completing} onClick={() => setConfirmComplete(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmComplete(true)}
                        className="gap-1.5"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Mark as complete
                      </Button>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        That&apos;s a wrap! Another tail well told 🐾
                      </p>
                    </>
                  )}
                </div>
              )}

              {stay.status === "completed" && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="secondary" size="sm" onClick={handleReactivate} className="gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Reactivate stay
                  </Button>
                  <p className="mt-1.5 text-xs text-muted-foreground">Pet coming back? We&apos;re always happy to see them again 🐾</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-destructive font-medium">Delete this stay?</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting}
                      onClick={handleDelete}
                    >
                      {deleting ? "Deleting…" : "Yes, delete"}
                    </Button>
                    <Button variant="outline" size="sm" disabled={deleting} onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete stay
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Private notes */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Private notes
            </p>
            {!editingNote && (
              <Button variant="ghost" size="sm" onClick={startEditingNote} className="gap-1.5 h-7 text-xs">
                <Pencil className="h-3 w-3" />
                {pinnedNote?.content ? "Edit" : "Add"}
              </Button>
            )}
          </div>

          {editingNote ? (
            <div className="flex flex-col gap-2">
              <Textarea
                ref={noteTextareaRef}
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                onKeyDown={handleNoteKeyDown}
                placeholder="Medication schedule, feeding amounts, emergency contacts…"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveNote} disabled={savingNote} className="gap-1.5">
                  {savingNote ? "Saving…" : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEditingNote} disabled={savingNote}>
                  Cancel
                </Button>
                <p className="text-xs text-muted-foreground ml-auto">⌘↵ to save · Esc to cancel</p>
              </div>
            </div>
          ) : pinnedNote?.content ? (
            <div>
              <p className="text-sm whitespace-pre-wrap">{pinnedNote.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Updated {new Date(pinnedNote.updated_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          ) : (
            <p
              className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
              onClick={startEditingNote}
            >
              Add private notes…
            </p>
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
