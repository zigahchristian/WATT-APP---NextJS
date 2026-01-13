// app/auth/signin/page.tsx
import SignInForm from "@/components/auth/signin-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // If user is already authenticated, redirect to home
  if (session) {
    redirect("/students");
  }

  return <SignInForm />;
}
