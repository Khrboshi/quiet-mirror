"use client";
import { useEffect } from "react";
import ErrorPage from "@/app/components/ErrorPage";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <ErrorPage reset={reset} message="Your entries are safe. Reload to try again." backHref="/dashboard" backLabel="Back to dashboard" />;
}
