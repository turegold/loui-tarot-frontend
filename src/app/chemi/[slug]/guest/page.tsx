"use client";

import { useParams, useRouter } from "next/navigation";
import { DrawFlow } from "@/components/DrawFlow";
import { createChemiGuestDraw } from "@/api/client";

export default function ChemiGuestPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  return (
    <DrawFlow
      description="케미 결과에 표시될 이름이에요. 순위/별자리 화면에 짧게 표시돼서 6자까지만 입력할 수 있어요."
      drawHint="카드를 탭해서 골라보세요"
      nameMaxLength={6}
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
