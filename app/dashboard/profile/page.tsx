"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToJpeg } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { BoarderRow } from "@/lib/types";

export default function ProfilePage() {
  const [boarder, setBoarder] = useState<BoarderRow | null>(null);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("boarders")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setBoarder(data);
        setName(data.name);
      }
    });
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let avatar_url = boarder?.avatar_url ?? null;

      if (avatarFile) {
        const resized = await resizeImageToJpeg(avatarFile, 400, 0.9);
        const path = `profiles/${user.id}/avatar.jpg`;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/stay-media/${path}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "image/jpeg",
              "x-upsert": "true",
            },
            body: resized,
          }
        );
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Failed to upload avatar (${res.status}): ${body}`);
        }

        avatar_url = supabase.storage
          .from("stay-media")
          .getPublicUrl(path).data.publicUrl;
      }

      const { data, error: updateError } = await supabase
        .from("boarders")
        .update({ name, avatar_url })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setBoarder(data);
      setAvatarFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (!boarder) {
    return (
      <div className="mt-16 text-center text-muted-foreground">
        Fetching your profile… 🐾
      </div>
    );
  }

  const displayAvatar = avatarPreview ?? boarder.avatar_url;

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-6">Your profile</h2>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {displayAvatar && (
                  <AvatarImage src={displayAvatar} alt={boarder.name} />
                )}
                <AvatarFallback className="bg-accent text-2xl">🐾</AvatarFallback>
              </Avatar>
              <div className="grid gap-1.5 flex-1">
                <Label htmlFor="avatar">Profile photo</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <p className="text-xs text-muted-foreground">
                Shown to pet owners at the top of their feed.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : saved ? "Saved! ✓" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
