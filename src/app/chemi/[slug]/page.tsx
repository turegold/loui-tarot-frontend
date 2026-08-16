"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { CardFace } from "@/components/TarotCard";
import { LoadingState } from "@/components/LoadingState";
import { getChemiDraw, getMyGuestDrawSlug, isOwnedChemiSlug } from "@/api/client";
import type { ChemiDraw } from "@/types";

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

export default function ChemiDrawPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [draw, setDraw] = useState<ChemiDraw | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // 이 브라우저가 이 host에게 이미 게스트로 뽑아준 적이 있으면(재방문), 다시 뽑기를 유도하지
    // 않고 그때 만들어진 케미 결과로 바로 보낸다.
    const existingGuestSlug = getMyGuestDrawSlug(slug);
    if (existingGuestSlug && !isOwnedChemiSlug(slug)) {
      router.replace(`/chemi/${slug}/vs/${existingGuestSlug}`);
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

  // 방장 본인 — 자신의 결과 + 공유 CTA + 재방문 시 케미 순위 진입점
  if (isOwner) {
    return (
      <div className="screen">
        <Blobs />
        <Starfield />
        <TopBar backHref="/home" />
        <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span className="badge-pill">{draw.nickname}님의 카드</span>
          <CardFace name={draw.card.nameKr} reversed={draw.isReversed} />
          <div className="card-glass" style={{ padding: 20, width: "100%", marginTop: 8 }}>
            <p style={{ fontSize: "var(--text-body)", lineHeight: 1.6, color: "var(--text-secondary)" }}>{draw.interpretation}</p>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <CopyShareButton url={draw.shareUrl} />
            <Link href={`/chemi/${slug}/ranking`} className="btn-ghost">
              <Icon name="list" size={18} />
              케미 순위 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 게스트로 링크에 들어온 경우 — 방장 카드를 보여주고 "나도 뽑아보기"로 유도
  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "10px 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <h2 style={{ fontSize: 22, marginTop: 8 }}>
          {draw.nickname}님이
          <br />
          카드를 뽑았어요
        </h2>
        <CardFace name={draw.card.nameKr} reversed={draw.isReversed} width={130} height={182} />
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>
          너도 카드를 뽑으면
          <br />
          둘의 케미를 바로 확인할 수 있어요
        </p>
        <div style={{ width: "100%", marginTop: 8 }}>
          <Link href={`/chemi/${slug}/guest`} className="btn-primary">
            <Icon name="sparkle" size={18} color="#fff" />
            나도 뽑아보기
          </Link>
        </div>
      </div>
    </div>
  );
}
