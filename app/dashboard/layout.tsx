import Image from "next/image";
import { LayoutDashboard, User } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <nav className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-1 md:gap-2 font-extrabold text-sm md:text-lg tracking-tight">
            <Image src="/logo.png" alt="" width={40} height={40} className="h-9 md:h-10 w-auto" priority />
            <span className="hidden sm:inline">Tailspin</span>
          </a>
          <div className="flex items-center gap-1.5 md:gap-3">
            <a href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground p-1.5 hover:bg-accent rounded transition-colors" title="Dashboard">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </a>
            <a href="/dashboard/profile" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground p-1.5 hover:bg-accent rounded transition-colors" title="Profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </a>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}
