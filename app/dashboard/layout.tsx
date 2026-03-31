import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <div className="min-h-full">
      <nav className="border-b border-neutral-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <a href="/dashboard" className="text-lg font-bold tracking-tight">
            Tailspin
          </a>
          <SignOutButton />
        </div>
      </nav>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}
