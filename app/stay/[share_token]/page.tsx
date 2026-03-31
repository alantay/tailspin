import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import PhotoGrid from "@/components/PhotoGrid";
import type { StayWithBoarder, UploadRow } from "@/lib/types";

export const revalidate = 60;

type Props = {
  params: Promise<{ share_token: string }>;
};

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

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      {/* Boarder + pet header */}
      <div className="mb-6 flex items-center gap-3">
        {stay.boarders.avatar_url && (
          <Image
            src={stay.boarders.avatar_url}
            alt={stay.boarders.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-sm text-neutral-500">Staying with</p>
          <p className="font-medium">{stay.boarders.name}</p>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-3">
        {stay.pet_photo && (
          <Image
            src={stay.pet_photo}
            alt={stay.pet_name}
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{stay.pet_name}</h1>
          <p className="text-sm text-neutral-500">
            Since {startFormatted}
            {stay.end_date
              ? ` · until ${new Date(stay.end_date).toLocaleDateString("en", { month: "long", day: "numeric" })}`
              : ""}
          </p>
        </div>
      </div>

      {stay.note && (
        <p className="mb-6 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {stay.note}
        </p>
      )}

      <PhotoGrid uploads={uploads ?? []} petName={stay.pet_name} />
    </main>
  );
}
