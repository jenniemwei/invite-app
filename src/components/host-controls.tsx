"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw, LogOut } from "lucide-react";
import { Button, ErrorNotice } from "./ui";
import { post } from "@/lib/client";
export function RefreshButton() {
  const router = useRouter();
  return (
    <Button secondary onClick={() => router.refresh()}>
      <RefreshCw size={15} aria-hidden="true" />
      Refresh responses
    </Button>
  );
}
export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <>
      <button
        className="text-button"
        onClick={async () => {
          try {
            await post("/api/auth/logout");
            router.push("/login");
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <LogOut size={15} aria-hidden="true" />
        Sign out
      </button>
      <ErrorNotice message={error} />
    </>
  );
}
