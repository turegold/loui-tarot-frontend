"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { ScoreLink } from "@/components/TarotCard";
import { DrawFlow } from "@/components/DrawFlow";
import { LoadingState } from "@/components/LoadingState";
import { CopyShareButton } from "@/components/CopyShareButton";
import { ChemiRankingSection } from "@/components/ChemiRankingSection";
import { createChemiGuestDraw, getChemiDraw, getChemiRanking, getMyGuestDrawSlug } from "@/api/client";
import { useUrlSlug } from "@/utils/useUrlSlug";
import type { ChemiGuestResponse, ChemiRankingEntry } from "@/types";

export function ChemiGuestClient() {
  const slug = useUrlSlug(2);
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState<ChemiGuestResponse | null>(null);
  const [ranking, setRanking] = useState<ChemiRankingEntry[] | null>(null);

  // 이 브라우저가 이 host 링크로 이미 한 번 뽑았다면 다시 뽑게 하지 않고 그때 결과를 바로 보여준다.
  useEffect(() => {
    if (!slug) return;
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

  // 이 host의 케미 순위 — 게스트가 "케미 순위 보기"로 별도 이동하지 않고 자기 결과 화면에
  // 이어서 바로 볼 수 있게 한다. /chemi/{slug}로 이동시키면 이미 뽑은 게스트는 그 페이지에서
  // 곧바로 이 guest 페이지로 되돌려보내는 로직과 충돌해 제자리로 튕겨오기만 했다.
  useEffect(() => {
    if (!slug) return;
    let active = true;
    getChemiRanking(slug).then((res) => {
      if (active && res.success && res.data) setRanking(res.data);
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
        <TopBar backHref="/" />
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
            <CopyShareButton url={result.guestDraw.shareUrl} label="내 케미 링크 공유하기" />
          </div>
          <ChemiRankingSection rows={ranking} />
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
        // checking이 false가 된 시점엔 이미 slug가 resolve된 뒤라 null일 수 없다.
        const res = await createChemiGuestDraw(slug!, name);
        if (res.success && res.data) {
          setResult(res.data);
          // 방금 뽑은 내 결과가 순위표에도 바로 반영되도록 다시 불러온다.
          getChemiRanking(slug!).then((r) => {
            if (r.success && r.data) setRanking(r.data);
          });
          return;
        }
        return res.error?.message ?? "뽑기에 실패했어요.";
      }}
    />
  );
}
