"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, GhostButton, Icon, Starfield, TopBar } from "@/components/primitives";
import { ScoreLink } from "@/components/TarotCard";
import { DrawFlow } from "@/components/DrawFlow";
import { createChemiGuestDraw } from "@/api/client";
import type { ChemiGuestResponse } from "@/types";

export default function ChemiGuestPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [result, setResult] = useState<ChemiGuestResponse | null>(null);

  // 뽑기 직후 별도 페이지로 이동하지 않고, 같은 화면에서 바로 결과(방장과의 케미)를 보여준다.
  if (result) {
    return (
      <div className="screen">
        <Blobs />
        <Starfield />
        <TopBar onBack={() => router.push(`/chemi/${slug}`)} />
        <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 20px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span className="badge-pill">
            <Icon name="star" size={13} />
            {result.hostDraw.nickname} ✕ {result.guestDraw.nickname}
          </span>
          <ScoreLink
            score={result.chemi.score}
            left={{ name: result.hostDraw.card.nameKr, imageUrl: result.hostDraw.card.imageUrl, reversed: result.hostDraw.isReversed }}
            right={{ name: result.guestDraw.card.nameKr, imageUrl: result.guestDraw.card.imageUrl, reversed: result.guestDraw.isReversed }}
          />
          <div className="card-glass" style={{ padding: 20, width: "100%" }}>
            <p style={{ fontSize: "var(--text-body)", lineHeight: 1.6, color: "var(--text-secondary)" }}>{result.chemi.interpretation}</p>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {/* 게스트 본인 draw도 소유가 등록돼있어 이 링크로 들어가면 자신의 방장 화면(공유 CTA)이 뜬다 */}
            <Link href={`/chemi/${result.guestDraw.slug}`} className="btn-primary">
              <Icon name="sparkle" size={18} color="#fff" />
              내 케미 링크 공유하기
            </Link>
            {/* 순위는 별도 페이지가 아니라 방장 결과 화면(chemi/[slug])에 이어서 보인다 */}
            <GhostButton onClick={() => router.push(`/chemi/${slug}`)}>케미 순위 보기</GhostButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DrawFlow
      description="케미 결과에 표시될 이름이에요."
      drawHint="카드를 탭해서 골라보세요"
      onBack={() => router.push(`/chemi/${slug}`)}
      onSubmit={async (name) => {
        const res = await createChemiGuestDraw(slug, name);
        if (res.success && res.data) {
          setResult(res.data);
          return;
        }
        return res.error?.message ?? "뽑기에 실패했어요.";
      }}
    />
  );
}
