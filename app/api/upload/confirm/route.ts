import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { stay_id, path, caption, type = "photo" } = await request.json();
  if (!stay_id || !path) return new Response("Missing fields", { status: 400 });

  // Verify ownership
  const { data: stay } = await supabase
    .from("stays")
    .select("id")
    .eq("id", stay_id)
    .eq("boarder_id", user.id)
    .single();

  if (!stay) return new Response("Forbidden", { status: 403 });

  const file_url = supabase.storage
    .from("stay-media")
    .getPublicUrl(path).data.publicUrl;

  const { data: upload, error } = await supabase
    .from("uploads")
    .insert({ stay_id, type, file_url, caption: caption || null })
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(upload);
}
