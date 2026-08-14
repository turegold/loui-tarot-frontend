"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, Icon, PrimaryButton, Starfield, TopBar } from "@/components/primitives";
import { CardFace } from "@/components/TarotCard";
import { LoadingState } from "@/components/LoadingState";
import { getFortune } from "@/api/mockApi";
import type { FortuneResult, Topic } from "@/types";

const TOPIC_META: Record<Topic, { icon: string; title: string }> = {
  COMPREHENSIVE: { icon: "moon", title: "종합운" },
  LOVE: { icon: "heart", title: "연애운" },
  CAREER: { icon: "briefcase", title: "취업운" },
  WEALTH: { icon: "coin", title: "재물운" },
};

export default function FortuneResultPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    getFortune(slug).then((res) => {
      if (!active) return;
      if (res.success && res.data) setResult(res.data);
      else setNotFound(true);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", gap: 12 }}>
        <p style={{ color: "var(--text-secondary)" }}>존재하지 않는 결과예요.</p>
        <Link href="/" className="btn-text">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!result) return <LoadingState message="불러오는 중이에요…" />;

  const meta = TOPIC_META[result.topic];

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar onBack={() => router.push("/fortune/topic")} />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <span className="badge-pill">
          <Icon name={meta.icon} size={13} />
          {meta.title}
        </span>
        <CardFace name={result.card.nameKr} reversed={result.isReversed} />
        <div className="card-glass" style={{ padding: 20, width: "100%" }}>
          <p style={{ fontSize: "var(--text-body)", lineHeight: 1.6, color: "var(--text-secondary)" }}>{result.interpretation}</p>
        </div>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>내 기록에 저장되었어요</span>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          <PrimaryButton
            icon="share"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                // 클립보드 권한이 없는 환경은 조용히 무시 (임시 처리)
              }
            }}
          >
            {copied ? "링크 복사됨!" : "결과 공유하기"}
          </PrimaryButton>
          <Link href="/fortune/topic" className="btn-ghost">
            다른 주제도 보기
          </Link>
          <Link href="/my" className="btn-ghost">
            내 기록 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
