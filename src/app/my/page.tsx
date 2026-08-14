"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { getCurrentUser, listMyFortunes } from "@/api/mockApi";
import type { FortuneResult, Topic } from "@/types";

const TOPIC_LABEL: Record<Topic, string> = {
  COMPREHENSIVE: "종합운",
  LOVE: "연애운",
  CAREER: "취업운",
  WEALTH: "재물운",
};

export default function MyPage() {
  const router = useRouter();
  const [rows, setRows] = useState<FortuneResult[] | null>(null);

  useEffect(() => {
    if (!getCurrentUser()) {
      router.replace("/login");
      return;
    }
    listMyFortunes().then((res) => {
      if (res.success && res.data) setRows(res.data);
    });
  }, [router]);

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar title="내 기록" onBack={() => router.push("/fortune/topic")} />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "8px 20px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        {rows?.length === 0 && (
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", textAlign: "center", marginTop: 40 }}>
            아직 뽑은 카드가 없어요.
          </p>
        )}
        {rows?.map((r) => (
          <Link key={r.slug} href={`/fortune/${r.slug}`} className="progress-list-row" style={{ textDecoration: "none", color: "inherit" }}>
            <div
              style={{
                width: 40,
                height: 56,
                borderRadius: 10,
                background: "linear-gradient(135deg,var(--lavender-300),var(--pink-accent))",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: "var(--text-body)" }}>{r.card.nameKr}</span>
              <span style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>
                {new Date(r.createdAt).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} · {TOPIC_LABEL[r.topic]}
              </span>
            </div>
            <Icon name="chevronRight" size={18} color="var(--text-muted)" />
          </Link>
        ))}
      </div>
    </div>
  );
}
