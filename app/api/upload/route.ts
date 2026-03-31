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

  const path = `stays/${stay_id}/${filename}`;
  const { data, error } = await supabase.storage
    .from("stay-media")
    .createSignedUploadUrl(path);

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ path, signedUrl: data.signedUrl });
}
