"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, GhostButton, Icon, Starfield, TopBar } from "@/components/primitives";
import { ScoreLink } from "@/components/TarotCard";
import { LoadingState } from "@/components/LoadingState";
import { getChemiVs } from "@/api/mockApi";
import type { ChemiGuestResponse } from "@/types";

export default function ChemiVsPage() {
  const { slug, guestSlug } = useParams<{ slug: string; guestSlug: string }>();
  const router = useRouter();
  const [data, setData] = useState<ChemiGuestResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    getChemiVs(slug, guestSlug).then((res) => {
      if (!active) return;
      if (res.success && res.data) setData(res.data);
      else setNotFound(true);
    });
    return () => {
      active = false;
    };
  }, [slug, guestSlug]);

  if (notFound) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", gap: 12 }}>
        <p style={{ color: "var(--text-secondary)" }}>존재하지 않는 케미 결과예요.</p>
        <Link href="/" className="btn-text">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!data) return <LoadingState message="케미를 계산하는 중이에요…" />;

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar onBack={() => router.push(`/chemi/${slug}`)} />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 20px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <span className="badge-pill">
          <Icon name="star" size={13} />
          {data.hostDraw.nickname} ✕ {data.guestDraw.nickname}
        </span>
        <ScoreLink
          score={data.chemi.score}
          left={{ name: data.hostDraw.card.nameKr, reversed: data.hostDraw.isReversed }}
          right={{ name: data.guestDraw.card.nameKr, reversed: data.guestDraw.isReversed }}
        />
        <div className="card-glass" style={{ padding: 20, width: "100%" }}>
          <p style={{ fontSize: "var(--text-body)", lineHeight: 1.6, color: "var(--text-secondary)" }}>{data.chemi.interpretation}</p>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          {/* 게스트 본인 draw도 소유가 등록돼있어 이 링크로 들어가면 자신의 방장 화면(공유 CTA)이 뜬다 */}
          <Link href={`/chemi/${data.guestDraw.slug}`} className="btn-primary">
            <Icon name="sparkle" size={18} color="#fff" />
            내 케미 링크 공유하기
          </Link>
          <GhostButton onClick={() => router.push(`/chemi/${slug}/ranking`)}>케미 순위 보기</GhostButton>
        </div>
      </div>
    </div>
  );
}
