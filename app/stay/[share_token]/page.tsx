import { notFound } from "next/navigation";
import Image from "next/image";
import { type Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PhotoGrid from "@/components/PhotoGrid";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import RefreshButton from "@/components/RefreshButton";
import BoardingNotes from "@/components/BoardingNotes";
import type { StayWithBoarder, UploadRow } from "@/lib/types";

export const revalidate = 60;

type Props = {
  params: Promise<{ share_token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { share_token } = await params;
  const supabase = await createClient();

  const { data: stay } = await supabase
    .from("stays")
    .select("pet_name, pet_photo, note, boarders(name)")
    .eq("share_token", share_token)
    .single<{ pet_name: string; pet_photo: string | null; note: string | null; boarders: { name: string } }>();

  if (!stay) return { title: "Tailspin" };

  const title = stay.boarders
    ? `${stay.pet_name}'s stay with ${stay.boarders.name}`
    : `${stay.pet_name}'s stay`;
  const description =
    stay.note ?? `Follow ${stay.pet_name}'s boarding stay — updated in real time.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(stay.pet_photo && { images: [{ url: stay.pet_photo, width: 800, height: 800 }] }),
    },
    twitter: {
      card: stay.pet_photo ? "summary_large_image" : "summary",
      title,
      description,
      ...(stay.pet_photo && { images: [stay.pet_photo] }),
    },
  };
}

export default async function OwnerFeedPage({ params }: Props) {
  const { share_token } = await params;
  const supabase = await createClient();

  const { data: stay } = await supabase
    .from("stays")
    .select("*, boarders(name, avatar_url)")
    .eq("share_token", share_token)
    .single<StayWithBoarder>();

  if (!stay) notFound();

  const { data: uploads } = await supabase
    .from("uploads")
    .select("*")
    .eq("stay_id", stay.id)
    .order("created_at", { ascending: false })
    .returns<UploadRow[]>();

  const startFormatted = new Date(stay.start_date).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
  });
  const endFormatted = stay.end_date
    ? new Date(stay.end_date).toLocaleDateString("en", { month: "long", day: "numeric" })
    : null;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      {/* Boarder info */}
      {stay.boarders && (
        <div className="mb-6 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {stay.boarders.avatar_url && (
              <AvatarImage src={stay.boarders.avatar_url} alt={stay.boarders.name} />
            )}
            <AvatarFallback className="bg-accent">🐾</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground">Staying with</p>
            <p className="font-semibold">{stay.boarders.name}</p>
          </div>
        </div>
      )}

      {/* Pet hero */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 pt-5">
          {stay.pet_photo ? (
            <Image
              src={stay.pet_photo}
              alt={stay.pet_name}
              width={64}
              height={64}
              className="rounded-full object-cover h-16 w-16 shrink-0"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-2xl shrink-0">
              🐾
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold">{stay.pet_name}</h1>
            <p className="text-sm text-muted-foreground">
              Since {startFormatted}
              {endFormatted ? ` · until ${endFormatted}` : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      {stay.note && (
        <BoardingNotes note={stay.note} startDate={stay.start_date} />
      )}

      <div className="mb-6 flex justify-center">
        <RefreshButton />
      </div>

      <PhotoGrid uploads={uploads ?? []} petName={stay.pet_name} />

      <p className="mt-12 text-center text-xs text-muted-foreground">
        Made with 🐾 Tailspin
      </p>
    </main>
  );
}
