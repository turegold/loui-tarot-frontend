"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DrawFlow } from "@/components/DrawFlow";
import { createChemiGuestDraw, getMyGuestDrawSlug } from "@/api/client";

export default function ChemiGuestPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // 이 브라우저가 이 host 링크로 이미 한 번 뽑았다면 다시 뽑게 하지 않고 그때 결과로 바로 보낸다.
  useEffect(() => {
    const existingGuestSlug = getMyGuestDrawSlug(slug);
    if (existingGuestSlug) {
      router.replace(`/chemi/${slug}/vs/${existingGuestSlug}`);
      return;
    }
    setReady(true);
  }, [slug, router]);

  if (!ready) return null;

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
