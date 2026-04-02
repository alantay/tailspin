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
      <nav className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-1.5 font-extrabold text-lg tracking-tight">
            <span>🐾</span> Tailspin
          </a>
          <div className="flex items-center gap-2">
            <a href="/dashboard/profile" className="text-sm text-muted-foreground hover:text-foreground">
              Profile
            </a>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}
