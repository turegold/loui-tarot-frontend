"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, GhostButton, Icon, Starfield, TopBar } from "@/components/primitives";
import { getCurrentUser, logout } from "@/api/client";
import type { User } from "@/types";

function HomeCard({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} className="hub-card" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="hub-icon">
        <Icon name={icon} size={22} color="#fff" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-subtitle)" }}>{title}</span>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--text-secondary)" }}>{desc}</span>
      </div>
      <Icon name="chevronRight" color="var(--text-muted)" />
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
      <TopBar
        right={
          <Link href="/my" className="iconbtn" aria-label="마이페이지">
            <Icon name="user" />
          </Link>
        }
      />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "10px 24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>{user.nickname}님</p>
          <h2 style={{ fontSize: 24, marginTop: 4 }}>
            오늘은 어떤 이야기가
            <br />
            궁금하세요?
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <HomeCard href="/chemi/new" icon="heart" title="케미 뽑기" desc="친구와 나의 궁합을 확인해보세요" />
          <HomeCard href="/fortune/topic" icon="moon" title="개인 카드 뽑기" desc="오늘의 주제별 운세를 뽑아보세요" />
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/my" className="btn-text" style={{ textAlign: "center" }}>
            내 기록 보기
          </Link>
          <GhostButton
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            로그아웃
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
