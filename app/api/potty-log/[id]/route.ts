import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: log } = await supabase
    .from("potty_logs")
    .select("id, stays(boarder_id)")
    .eq("id", id)
    .single();

  if (!log) return new Response("Not found", { status: 404 });

  const stay = log.stays as unknown as { boarder_id: string } | null;
  if (!stay || stay.boarder_id !== user.id)
    return new Response("Forbidden", { status: 403 });

  const { error } = await supabase.from("potty_logs").delete().eq("id", id);
  if (error) return new Response(error.message, { status: 500 });

  return new Response(null, { status: 204 });
}
