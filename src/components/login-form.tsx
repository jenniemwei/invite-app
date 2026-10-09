"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, ErrorNotice } from "./ui";
import { post } from "@/lib/client";
export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await post("/api/auth/login", {
        email: f.get("email"),
        password: f.get("password"),
      });
      router.push("/host");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <form className="form-stack" onSubmit={submit}>
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <ErrorNotice message={error} />
      <Button busy={busy}>Sign in</Button>
      <p className="fine-print">
        Use the host account created for this prototype. Guests don’t need an
        account.
      </p>
    </form>
  );
}
