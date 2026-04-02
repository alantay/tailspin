import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const stay_id = request.nextUrl.searchParams.get("stay_id");
  const filename =
    request.nextUrl.searchParams.get("filename") ??
    `${crypto.randomUUID()}.jpg`;

  if (!stay_id) return new Response("Missing stay_id", { status: 400 });

  // Verify the boarder owns this stay
  const { data: stay } = await supabase
    .from("stays")
    .select("id")
    .eq("id", stay_id)
    .eq("boarder_id", user.id)
    .single();

  if (!stay) return new Response("Forbidden", { status: 403 });

  // Return just the path — client will upload directly to Supabase Storage
  // REST API using its own session token (avoids signed URL 400 issues with video)
  const path = `stays/${stay_id}/${filename}`;
  return Response.json({ path });
}
