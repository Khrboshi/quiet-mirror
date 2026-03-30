"use client";
import { useEffect } from "react";
import ErrorPage from "@/app/components/ErrorPage";
import { ERRORS, NAV } from "@/app/lib/copy";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <ErrorPage reset={reset} message={ERRORS.safeReload} backHref="/dashboard" backLabel={NAV.backToDashboard} />;
}
