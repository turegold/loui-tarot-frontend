"use client";

// 임시 레이아웃 — 원래 13개 화면 킷에 없던 신규 화면이라 기존 컴포넌트로 기능만 구현해둠.
// 클로드 디자인 결과물이 나오면 이 화면을 그대로 리스킨할 예정 (07 디자인 컨셉 및 프롬프트 참고).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, Icon, Starfield } from "@/components/primitives";
import { getCurrentUser, logoutMock } from "@/api/mockApi";
import type { User } from "@/types";

function HomeCard({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="card-glass"
      style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, textDecoration: "none", color: "inherit" }}
    >
      <div className="topic-icon">
        <Icon name={icon} size={20} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-subtitle)" }}>{title}</div>
        <div style={{ fontSize: "var(--text-caption)", color: "var(--text-secondary)" }}>{desc}</div>
      </div>
      <Icon name="chevronRight" size={18} color="var(--text-muted)" />
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace("/");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return null;

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "60px 24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <span className="badge-pill">
            <Icon name="sparkle" size={13} />
            {user.nickname}님
          </span>
          <h1 style={{ fontSize: 26, marginTop: 12 }}>
            오늘은 어떤 카드를
            <br />
            만나볼까요?
          </h1>
        </div>

        <HomeCard href="/chemi/new" icon="sparkle" title="케미 뽑기" desc="카드를 뽑고 친구와 궁합을 확인해요" />
        <HomeCard href="/fortune/topic" icon="moon" title="개인 카드 뽑기" desc="주제별 운세를 뽑고 기록으로 남겨요" />

        <div style={{ flex: 1 }} />
        <Link href="/my" className="btn-ghost">
          내 기록 보기
        </Link>
        <button
          className="btn-text"
          style={{ alignSelf: "center" }}
          onClick={() => {
            logoutMock();
            router.push("/");
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
