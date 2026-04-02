import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/AuthForm";

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-4xl mb-3">🐶</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Join Tailspin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your future furry guests are out there somewhere.
          </p>
        </div>
        <AuthForm mode="signup" />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/" className="text-foreground font-medium underline underline-offset-4">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
