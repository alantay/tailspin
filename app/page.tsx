import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/AuthForm";
import Image from "next/image";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Tailspin" width={72} height={72} className="mx-auto mb-3" priority />
          <h1 className="text-3xl font-extrabold tracking-tight">Tailspin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload photos freely. Owners check in on their own terms.
          </p>
        </div>
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <a
            href="/auth/sign-up"
            className="text-foreground font-medium underline underline-offset-4"
          >
            Sign up — it&apos;s free
          </a>
        </p>
      </div>
    </main>
  );
}
