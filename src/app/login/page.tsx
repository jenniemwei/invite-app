import { redirect } from "next/navigation";
import { dataMode } from "@/lib/server/config";
import { LoginForm } from "@/components/login-form";
export const dynamic = "force-dynamic";
export default function Login() {
  if (dataMode() === "local") redirect("/host");
  return (
    <main id="main" className="login-page">
      <span className="app-label">Invitations</span>
      <h1>Welcome back.</h1>
      <p>Sign in to manage your events and invitations.</p>
      <LoginForm />
    </main>
  );
}
