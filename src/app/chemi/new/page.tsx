"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DrawFlow } from "@/components/DrawFlow";
import { createChemiDraw, getCurrentUser } from "@/api/mockApi";

export default function NewChemiDrawPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getCurrentUser()) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <DrawFlow
      drawHint="카드를 탭해서 골라보세요"
      skipNameStep
      onBack={() => router.push("/home")}
      onSubmit={async () => {
        const res = await createChemiDraw();
        if (res.success && res.data) {
          router.push(`/chemi/${res.data.slug}`);
          return;
        }
        return res.error?.message ?? "뽑기에 실패했어요.";
      }}
    />
  );
}
