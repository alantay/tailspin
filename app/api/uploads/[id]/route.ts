import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/uploads/[id] — delete upload from DB and storage
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Fetch upload and verify ownership via stay
  const { data: upload } = await supabase
    .from("uploads")
    .select("id, file_url, stay_id, stays(boarder_id)")
    .eq("id", id)
    .single();

  if (!upload) return new Response("Not found", { status: 404 });

  const stay = upload.stays as unknown as { boarder_id: string } | null;
  if (!stay || stay.boarder_id !== user.id)
    return new Response("Forbidden", { status: 403 });

  // Extract storage path from public URL
  // URL format: .../storage/v1/object/public/stay-media/stays/...
  const url = new URL(upload.file_url);
  const storagePath = url.pathname.replace(
    /^\/storage\/v1\/object\/public\/stay-media\//,
    ""
  );

  // Delete from storage (best-effort — don't fail if already gone)
  await supabase.storage.from("stay-media").remove([storagePath]);

  // Delete from DB
  const { error } = await supabase.from("uploads").delete().eq("id", id);
  if (error) return new Response(error.message, { status: 500 });

  return new Response(null, { status: 204 });
}

// PATCH /api/uploads/[id] — update caption
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { caption } = await req.json();

  // Verify ownership via stay
  const { data: upload } = await supabase
    .from("uploads")
    .select("id, stay_id, stays(boarder_id)")
    .eq("id", id)
    .single();

  if (!upload) return new Response("Not found", { status: 404 });

  const stay = upload.stays as unknown as { boarder_id: string } | null;
  if (!stay || stay.boarder_id !== user.id)
    return new Response("Forbidden", { status: 403 });

  const { data, error } = await supabase
    .from("uploads")
    .update({ caption: caption || null })
    .eq("id", id)
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data);
}
