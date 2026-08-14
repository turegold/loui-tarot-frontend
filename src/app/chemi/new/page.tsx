"use client";

import { useRouter } from "next/navigation";
import { DrawFlow } from "@/components/DrawFlow";
import { createChemiDraw } from "@/api/mockApi";

export default function NewChemiDrawPage() {
  const router = useRouter();

  return (
    <DrawFlow
      description="결과 카드와 공유 링크에 표시될 이름이에요."
      drawHint="카드를 탭하면 바로 결과를 확인해요"
      onBack={() => router.push("/")}
      onSubmit={async (name) => {
        const res = await createChemiDraw(name);
        if (res.success && res.data) {
          router.push(`/chemi/${res.data.slug}`);
          return;
        }
        return res.error?.message ?? "뽑기에 실패했어요.";
      }}
    />
  );
}
