"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { CardFace } from "@/components/TarotCard";
import { ConstellationMap } from "@/components/ConstellationMap";
import { LoadingState } from "@/components/LoadingState";
import { getChemiDraw, getChemiRanking, isOwnedChemiSlug } from "@/api/client";
import type { ChemiDraw, ChemiRankingEntry } from "@/types";

function CopyShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn-primary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // 클립보드 권한이 없는 환경은 조용히 무시 (임시 처리)
        }
      }}
    >
      <Icon name="share" size={18} color="#fff" />
      {copied ? "링크 복사됨!" : "케미 보기 링크 공유"}
    </button>
  );
}

/** 케미 순위(리스트 + 별자리 지도) — 탭으로 나누지 않고 한 화면에 쭉 이어서 보여준다. */
function ChemiRankingSection({ rows }: { rows: ChemiRankingEntry[] | null }) {
  const count = rows?.length ?? 0;
  return (
    <div className="card-glass" style={{ width: "100%", padding: 20, marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-subtitle)" }}>케미 순위 · {count}명</span>
        <span className="badge-pill">
          <Icon name="list" size={13} />
          방문자
        </span>
      </div>

      {count === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-caption)", textAlign: "center", padding: "12px 0" }}>
          아직 아무도 없어요 — 링크를 공유하면 친구들이 여기 올라와요.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows!.map((r, i) => (
            <div key={i} className="progress-list-row">
              <span style={{ width: 22, textAlign: "center", color: "var(--lavender-300)", fontFamily: "var(--font-display)" }}>{i + 1}</span>
              <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: "var(--text-caption)", flexShrink: 0 }}>
                {r.guestNickname.slice(0, 1)}
              </div>
              <span style={{ fontSize: "var(--text-body)", flexShrink: 0 }}>
                {r.guestNickname} <span style={{ color: "var(--text-muted)" }}>- {r.guestCard.nameKr} 카드</span>
              </span>
              <div style={{ flex: 1 }} />
              <img
                src={r.guestCard.imageUrl}
                alt={r.guestCard.nameKr}
                style={{ width: 30, height: 52, objectFit: "contain", borderRadius: 6, background: "var(--bg-card-strong)", flexShrink: 0 }}
              />
              <span className="badge-pill">{r.score}점</span>
            </div>
          ))}
        </div>
      )}

      <ConstellationMap entries={rows ?? []} />
    </div>
  );
}

export default function ChemiDrawPage() {
  const { slug } = useParams<{ slug: string }>();
  const [draw, setDraw] = useState<ChemiDraw | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [ranking, setRanking] = useState<ChemiRankingEntry[] | null>(null);

  useEffect(() => {
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
  }, [slug]);

  // 케미 순위는 카드 결과와 독립적으로 불러온다 — 이 slug가 방장으로 쓰인 적 없으면 빈 목록으로 온다.
  useEffect(() => {
    let active = true;
    getChemiRanking(slug).then((res) => {
      if (active && res.success && res.data) setRanking(res.data);
    });
    return () => {
      active = false;
    };
  }, [slug]);

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

  // 방장 본인 — 자신의 결과 + 공유 CTA + 케미 순위까지 한 화면에 이어서 보여준다
  if (isOwner) {
    return (
      <div className="screen">
        <Blobs />
        <Starfield />
        <TopBar backHref="/home" />
        <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span className="badge-pill">{draw.nickname}님의 카드</span>
          <CardFace name={draw.card.nameKr} imageUrl={draw.card.imageUrl} reversed={draw.isReversed} />
          <div className="card-glass" style={{ padding: 20, width: "100%", marginTop: 8 }}>
            <p style={{ fontSize: "var(--text-body)", lineHeight: 1.6, color: "var(--text-secondary)" }}>{draw.interpretation}</p>
          </div>
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
        <h2 style={{ fontSize: 22, marginTop: 8 }}>
          {draw.nickname}님이
          <br />
          카드를 뽑았어요
        </h2>
        <CardFace name={draw.card.nameKr} imageUrl={draw.card.imageUrl} reversed={draw.isReversed} width={130} />
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
