import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { stay_id, event_type } = await request.json();
  if (!stay_id || !event_type) return new Response("Missing fields", { status: 400 });
  if (event_type !== "pee" && event_type !== "poop")
    return new Response("Invalid event_type", { status: 400 });

  const { data: stay } = await supabase
    .from("stays")
    .select("id")
    .eq("id", stay_id)
    .eq("boarder_id", user.id)
    .single();

  if (!stay) return new Response("Forbidden", { status: 403 });

  const { data: log, error } = await supabase
    .from("potty_logs")
    .insert({ stay_id, event_type })
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(log);
}
