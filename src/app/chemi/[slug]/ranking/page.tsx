"use client";

// 케미 순위 리스트 — 02 주요 기능 정의.md 기준 2차 고도화 기능. 라우트/화면은 미리 구현해둔다.

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { ConstellationMap } from "@/components/ConstellationMap";
import { getChemiRanking } from "@/api/client";
import type { ChemiRankingEntry } from "@/types";

type View = "list" | "map";

export default function ChemiRankingPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [rows, setRows] = useState<ChemiRankingEntry[] | null>(null);
  const [view, setView] = useState<View>("list");

  useEffect(() => {
    let active = true;
    getChemiRanking(slug).then((res) => {
      if (active && res.success && res.data) setRows(res.data);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar title="케미 순위" onBack={() => router.push(`/chemi/${slug}`)} />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "8px 20px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="tab-row">
          <button className={"tab-btn" + (view === "list" ? " active" : "")} onClick={() => setView("list")}>
            <Icon name="list" size={15} />
            리스트로 보기
          </button>
          <button className={"tab-btn" + (view === "map" ? " active" : "")} onClick={() => setView("map")}>
            <Icon name="sparkle" size={15} />
            별자리로 보기
          </button>
        </div>

        {view === "list" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-caption)", marginBottom: 2 }}>
              {rows?.length ? "나에게 케미를 확인하러 온 친구들" : "아직 케미를 보러 온 친구가 없어요"}
            </p>
            {rows?.map((r, i) => (
              <div key={i} className="progress-list-row">
                <span style={{ width: 22, textAlign: "center", color: "var(--lavender-300)", fontFamily: "var(--font-display)" }}>{i + 1}</span>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-card-strong)" }} />
                <span style={{ flex: 1, fontSize: "var(--text-body)" }}>{r.guestNickname}</span>
                <span className="badge-pill">{r.score}점</span>
              </div>
            ))}
          </div>
        ) : (
          <ConstellationMap entries={rows ?? []} />
        )}
      </div>
    </div>
  );
}
