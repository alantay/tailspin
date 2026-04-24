"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateShareToken, resizeImageToJpeg } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NewStayPage() {
  const router = useRouter();
  const [petName, setPetName] = useState("");
  const [note, setNote] = useState("");
  const [mealSchedule, setMealSchedule] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [petPhotoFile, setPetPhotoFile] = useState<File | null>(null);
  const [petPhotoPreview, setPetPhotoPreview] = useState<string | null>(null);
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
          owner_name: ownerName.trim() || null,
          phone_number: phoneNumber.trim() || null,
          note: note || null,
          meal_schedule: mealSchedule.trim() || null,
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
      <h2 className="text-2xl font-extrabold mb-6">New stay 🐾</h2>
      <Card>
        <CardHeader />
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-1.5">
              <Label htmlFor="petName">
                Pet name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="petName"
                type="text"
                required
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Biscuit"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ownerName">Owner name <span className="text-destructive">*</span></Label>
              <Input
                id="ownerName"
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phoneNumber">Owner phone (optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+65 9123 4567"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="petPhoto">Pet photo (optional)</Label>
              <Input
                id="petPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setPetPhotoFile(file);
                  setPetPhotoPreview(file ? URL.createObjectURL(file) : null);
                }}
                className="cursor-pointer"
              />
              {petPhotoPreview && (
                <img
                  src={petPhotoPreview}
                  alt="Pet photo preview"
                  className="mt-2 h-32 w-32 rounded-xl object-cover"
                />
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="note">Boarding notes (optional)</Label>
              <Textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What should the owner bring? (medication, favourite toys, food preferences…)"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="mealSchedule">Meal schedule (optional)</Label>
              <Textarea
                id="mealSchedule"
                rows={3}
                value={mealSchedule}
                onChange={(e) => setMealSchedule(e.target.value)}
                placeholder="8am: 1 cup kibbles + wet food / 6pm: rice with minced meat"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="startDate">
                  Start date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endDate">End date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating…" : "Create stay"}
              </Button>
              <a href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
                Cancel
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
