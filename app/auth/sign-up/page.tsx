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
          <h1 className="text-3xl font-bold tracking-tight">Tailspin</h1>
          <p className="mt-2 text-sm text-neutral-500">Create your boarder account</p>
        </div>
        <AuthForm mode="signup" />
        <p className="mt-4 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <a href="/" className="text-neutral-900 underline underline-offset-4">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
