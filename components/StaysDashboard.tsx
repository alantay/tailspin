import { createClient } from "@/lib/supabase/server";
import StayCard from "@/components/StayCard";
import DashboardCalendar from "@/components/DashboardCalendar";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import type { StayRow } from "@/lib/types";

export default async function StaysDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().slice(0, 10);

  // fire-and-forget — runs in parallel with the select below
  supabase
    .from("stays")
    .update({ status: "completed" })
    .eq("boarder_id", user!.id)
    .eq("status", "active")
    .not("end_date", "is", null)
    .lt("end_date", today);

  const { data: stays } = await supabase
    .from("stays")
    .select("*, uploads(id, type, created_at)")
    .eq("boarder_id", user!.id)
    .order("created_at", { ascending: false });

  const active = (stays ?? []).filter((s: StayRow) => s.status === "active");
  const past = (stays ?? []).filter((s: StayRow) => s.status === "completed");

  return (
    <>
      <div className="mt-6">
        <DashboardCalendar stays={stays ?? []} />
      </div>

      {active.length > 0 && (
        <section className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active
          </p>
          <div className="flex flex-col gap-2">
            {active.map((stay: StayRow & { uploads: { type: string; created_at: string }[] }) => (
              <StayCard key={stay.id} stay={stay} uploads={stay.uploads ?? []} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Past stays
          </p>
          <div className="flex flex-col gap-2">
            {past.map((stay: StayRow & { uploads: { type: string; created_at: string }[] }) => (
              <StayCard key={stay.id} stay={stay} uploads={stay.uploads ?? []} />
            ))}
          </div>
        </section>
      )}

      {(stays ?? []).length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-4xl mb-3">🐶</p>
          <p className="font-semibold text-lg">No stays yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your future furry guests are out there somewhere, probably chewing a shoe.
          </p>
          <a href="/dashboard/new" className={cn(buttonVariants(), "mt-6 inline-flex")}>
            Create your first stay
          </a>
        </div>
      )}
    </>
  );
}
