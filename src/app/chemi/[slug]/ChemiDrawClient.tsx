"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { CardFace } from "@/components/TarotCard";
import { LoadingState } from "@/components/LoadingState";
import { CopyShareButton } from "@/components/CopyShareButton";
import { ChemiRankingSection } from "@/components/ChemiRankingSection";
import { ChemiMatchResult } from "@/components/ChemiMatchResult";
import { getChemiDraw, getChemiRanking, getMyGuestDrawSlug, isOwnedChemiSlug } from "@/api/client";
import { useUrlSlug } from "@/utils/useUrlSlug";
import type { ChemiDraw, ChemiRankingEntry } from "@/types";

export function ChemiDrawClient() {
  const slug = useUrlSlug(2);
  const router = useRouter();
  const [draw, setDraw] = useState<ChemiDraw | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [ranking, setRanking] = useState<ChemiRankingEntry[] | null>(null);

  useEffect(() => {
    if (!slug) return;

    // 이 브라우저가 이 host에게 이미 게스트로 뽑아준 적이 있으면(재방문), 다시 뽑기를 유도하지
    // 않고 그때 만들어진 케미 결과로 바로 보낸다 — guest 페이지가 기존 draw를 감지해서 보여준다.
    if (getMyGuestDrawSlug(slug) && !isOwnedChemiSlug(slug)) {
      router.replace(`/chemi/${slug}/guest`);
      return;
    }

    let active = true;
    getChemiDraw(slug).then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setDraw(res.data);
        setIsOwner(isOwnedChemiSlug(slug));
      } else {
        setNotFound(true);
      }
    });
    return () => {
      active = false;
    };
  }, [slug, router]);

  // 케미 순위는 화면 위쪽 비교 결과와 짝을 맞춘다 — 이 draw가 게스트로서 이미 어떤 host와
  // 매칭됐다면(hostDraw/chemi 있음) 그 host의 순위표를, 매칭 전(진짜 방장 draw)이라면
  // 이 draw 자신의 순위표를 보여준다. 예: A의 host draw에 B가 게스트로 뽑아 AxB 매칭이
  // 생겼다면, B의 공유 링크를 열어도 "A의 순위"가 나와야지 이제 막 생긴 B 자신의(거의
  // 항상 비어 있는) 순위표가 나오면 안 된다.
  useEffect(() => {
    if (!draw) return;
    const rankingSlug = draw.hostDraw && draw.chemi ? draw.hostDraw.slug : draw.slug;
    let active = true;
    getChemiRanking(rankingSlug).then((res) => {
      if (active && res.success && res.data) setRanking(res.data);
    });
    return () => {
      active = false;
    };
  }, [draw]);

  if (notFound) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", gap: 12 }}>
        <p style={{ color: "var(--text-secondary)" }}>존재하지 않는 링크예요.</p>
        <Link href="/" className="btn-text">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!draw) return <LoadingState message="불러오는 중이에요…" />;

  // 이 draw가 (게스트로서) 다른 방장과 이미 케미 비교를 마친 적 있다면 hostDraw/chemi가
  // 채워져 있으니, 누가 이 링크를 보든(본인이든 공유받은 사람이든) 그 비교 결과(둘의
  // 카드+점수)를 보여준다 — "내 케미 링크 공유하기"로 공유했을 때 상대방이 자기 카드만
  // 덩그러니 보게 되는 걸 막기 위함이다.
  const matched = draw.hostDraw && draw.chemi ? { host: draw.hostDraw, chemi: draw.chemi } : null;

  // 방장 본인 — 자신의 결과 + 공유 CTA + 케미 순위까지 한 화면에 이어서 보여준다.
  if (isOwner) {
    return (
      <div className="screen">
        <Blobs />
        <Starfield />
        <TopBar backHref="/home" />
        <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {matched ? (
            <ChemiMatchResult
              leftNickname={matched.host.nickname}
              leftCard={matched.host.card}
              leftReversed={matched.host.isReversed}
              rightNickname={draw.nickname}
              rightCard={draw.card}
              rightReversed={draw.isReversed}
              score={matched.chemi.score}
              interpretation={matched.chemi.interpretation}
            />
          ) : (
            <>
              <span className="badge-pill">{draw.nickname}님의 카드</span>
              <CardFace name={draw.card.nameKr} imageUrl={draw.card.imageUrl} reversed={draw.isReversed} />
              <div className="card-glass" style={{ padding: 20, width: "100%", marginTop: 8 }}>
                <p style={{ fontSize: "var(--text-body)", lineHeight: 1.6, color: "var(--text-secondary)" }}>{draw.interpretation}</p>
              </div>
            </>
          )}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <CopyShareButton url={draw.shareUrl} />
          </div>
          <ChemiRankingSection rows={ranking} />
        </div>
      </div>
    );
  }

  // 게스트로 링크에 들어온 경우 — 방장 카드 + "나도 뽑아보기" + 방장의 케미 순위까지 이어서 보여준다
  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar backHref="/" />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "10px 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        {matched ? (
          <ChemiMatchResult
            leftNickname={matched.host.nickname}
            leftCard={matched.host.card}
            leftReversed={matched.host.isReversed}
            rightNickname={draw.nickname}
            rightCard={draw.card}
            rightReversed={draw.isReversed}
            score={matched.chemi.score}
            interpretation={matched.chemi.interpretation}
          />
        ) : (
          <>
            <h2 style={{ fontSize: 22, marginTop: 8 }}>
              {draw.nickname}님이
              <br />
              카드를 뽑았어요
            </h2>
            <CardFace name={draw.card.nameKr} imageUrl={draw.card.imageUrl} reversed={draw.isReversed} width={130} />
          </>
        )}
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>
          카드를 뽑으면
          <br />
          둘의 케미를 바로 확인할 수 있어요
        </p>
        <div style={{ width: "100%", marginTop: 8 }}>
          <Link href={`/chemi/${slug}/guest`} className="btn-primary">
            <Icon name="sparkle" size={18} color="#fff" />
            나도 뽑아보기
          </Link>
        </div>
        <ChemiRankingSection rows={ranking} />
      </div>
    </div>
  );
}
