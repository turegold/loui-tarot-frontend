"use client";

import { useParams, useRouter } from "next/navigation";
import { DrawFlow } from "@/components/DrawFlow";
import { createChemiGuestDraw } from "@/api/mockApi";

export default function ChemiGuestPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  return (
    <DrawFlow
      description="케미 결과에 표시될 이름이에요."
      drawHint="카드를 탭해서 골라보세요"
      onBack={() => router.back()}
      onSubmit={async (name) => {
        const res = await createChemiGuestDraw(slug, name);
        if (res.success && res.data) {
          router.push(`/chemi/${slug}/vs/${res.data.guestDraw.slug}`);
          return;
        }
        return res.error?.message ?? "뽑기에 실패했어요.";
      }}
    />
  );
}
