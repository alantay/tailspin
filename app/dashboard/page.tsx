import { createClient } from "@/lib/supabase/server";
import StayCard from "@/components/StayCard";
import type { StayRow } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stays } = await supabase
    .from("stays")
    .select("*")
    .eq("boarder_id", user!.id)
    .order("created_at", { ascending: false });

  const active = (stays ?? []).filter((s: StayRow) => s.status === "active");
  const past = (stays ?? []).filter((s: StayRow) => s.status === "completed");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your stays</h2>
        <a
          href="/dashboard/new"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          New stay
        </a>
      </div>

      {active.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Active
          </h3>
          <div className="flex flex-col gap-2">
            {active.map((stay: StayRow) => (
              <StayCard key={stay.id} stay={stay} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Past stays
          </h3>
          <div className="flex flex-col gap-2">
            {past.map((stay: StayRow) => (
              <StayCard key={stay.id} stay={stay} />
            ))}
          </div>
        </section>
      )}

      {(stays ?? []).length === 0 && (
        <div className="mt-12 text-center text-neutral-400">
          <p>No stays yet.</p>
          <p className="mt-1 text-sm">
            Create a stay and start sharing photos.
          </p>
        </div>
      )}
    </div>
  );
}
