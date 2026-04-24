import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

async function authorize(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Response("Unauthorized", { status: 401 }) };

  const { data: log } = await supabase
    .from("meal_logs")
    .select("id, stays(boarder_id)")
    .eq("id", id)
    .single();

  if (!log) return { error: new Response("Not found", { status: 404 }) };

  const stay = log.stays as unknown as { boarder_id: string } | null;
  if (!stay || stay.boarder_id !== user.id)
    return { error: new Response("Forbidden", { status: 403 }) };

  return { supabase };
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await authorize(id);
  if (auth.error) return auth.error;

  const { error } = await auth.supabase.from("meal_logs").delete().eq("id", id);
  if (error) return new Response(error.message, { status: 500 });

  return new Response(null, { status: 204 });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await authorize(id);
  if (auth.error) return auth.error;

  const { created_at } = await request.json();
  if (!created_at || isNaN(new Date(created_at).getTime()))
    return new Response("Invalid created_at", { status: 400 });

  const { data, error } = await auth.supabase
    .from("meal_logs")
    .update({ created_at })
    .eq("id", id)
    .select()
    .single();
  if (error) return new Response(error.message, { status: 500 });

  return Response.json(data);
}
