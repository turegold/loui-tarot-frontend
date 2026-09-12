"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, GhostButton, Icon, Starfield, TopBar } from "@/components/primitives";
import { ScoreLink } from "@/components/TarotCard";
import { DrawFlow } from "@/components/DrawFlow";
import { LoadingState } from "@/components/LoadingState";
import { createChemiGuestDraw, getChemiDraw, getMyGuestDrawSlug } from "@/api/client";
import type { ChemiGuestResponse } from "@/types";

export default function ChemiGuestPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState<ChemiGuestResponse | null>(null);

  // 이 브라우저가 이 host 링크로 이미 한 번 뽑았다면 다시 뽑게 하지 않고 그때 결과를 바로 보여준다.
  useEffect(() => {
    let active = true;
    const existingGuestSlug = getMyGuestDrawSlug(slug);
    if (!existingGuestSlug) {
      setChecking(false);
      return;
    }
    getChemiDraw(existingGuestSlug).then((res) => {
      if (!active) return;
      if (res.success && res.data && res.data.hostDraw && res.data.chemi) {
        setResult({ guestDraw: res.data, hostDraw: res.data.hostDraw, chemi: res.data.chemi });
      }
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (checking) return <LoadingState message="불러오는 중이에요…" />;

  // 뽑기 직후(또는 재방문 시) 별도 페이지로 이동하지 않고, 같은 화면에서 바로 결과(방장과의 케미)를 보여준다.
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
      description="케미 결과에 표시될 이름이에요. 순위/별자리 화면에 짧게 표시돼서 6자까지만 입력할 수 있어요."
      drawHint="카드를 탭해서 골라보세요"
      nameMaxLength={6}
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
