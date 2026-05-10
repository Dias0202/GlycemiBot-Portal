"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    api.portal.me()
      .then(() => router.replace("/dashboard"))
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="h-3 w-3 animate-pulse rounded-full bg-violet-600" />
    </div>
  );
}
