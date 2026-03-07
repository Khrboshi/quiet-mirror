"use client";

import { SupabaseSessionProvider } from "@/components/SupabaseSessionProvider";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import { PostHogProvider } from "./components/PostHogProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <SupabaseSessionProvider>
        <ServiceWorkerRegister />
        {children}
      </SupabaseSessionProvider>
    </PostHogProvider>
  );
}
