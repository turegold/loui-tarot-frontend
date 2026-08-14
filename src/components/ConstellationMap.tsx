"use client";

import { useMemo } from "react";
import { chemiTier, type ChemiTier } from "@/utils/chemiScore";
import type { ChemiRankingEntry } from "@/types";

/** 케미 지도(별자리 뷰) — 케미 점수 산출 로직.md의 5단계 점수 구간을 별자리 그룹으로 사용 */
const GROUP_META: { tier: ChemiTier; color: string }[] = [
  { tier: "천생연분", color: "#FFFFFF" },
  { tier: "잘 맞음", color: "#D2C2FF" },
  { tier: "무난", color: "#A78BFA" },
  { tier: "노력 필요", color: "#F3C6E8" },
  { tier: "상극", color: "#8b7fa8" },
];

const CX = 150;
const CY = 150;
const R_BASE = 32;
const R_MAX = 96;
const PILL_R = 80;

interface StarNode {
  name: string;
  score: number;
  x: number;
  y: number;
  color: string;
}

export function ConstellationMap({ entries }: { entries: ChemiRankingEntry[] }) {
  const layout = useMemo(() => {
    const byGroup = GROUP_META.map((g) => ({ g, members: entries.filter((e) => chemiTier(e.score) === g.tier) }));
    const nodes: StarNode[] = [];
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    const pills: { label: string; count: number; x: number; y: number; color: string }[] = [];

    byGroup.forEach((entry, gi) => {
      if (!entry.members.length) return;
      // 5개 그룹이 원을 72도씩 나눠 갖고, 각 섹터 안쪽 60도에만 점을 찍어 그룹 사이에 여백을 둔다
      const sectorStart = -90 + gi * 72 + 6;
      const span = 60;
      const step = span / (entry.members.length + 1);

      const pts: StarNode[] = entry.members.map((p, i) => {
        const angleDeg = sectorStart + step * (i + 1);
        const rad = (angleDeg * Math.PI) / 180;
        const r = R_BASE + ((100 - p.score) / 100) * (R_MAX - R_BASE);
        return { name: p.guestNickname, score: p.score, x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad), color: entry.g.color };
      });
      nodes.push(...pts);
      for (let i = 1; i < pts.length; i++) {
        lines.push({ key: `${entry.g.tier}-${i}`, x1: pts[i - 1].x, y1: pts[i - 1].y, x2: pts[i].x, y2: pts[i].y, color: entry.g.color });
      }

      const midRad = ((sectorStart + span / 2) * Math.PI) / 180;
      pills.push({ label: entry.g.tier, count: entry.members.length, x: CX + PILL_R * Math.cos(midRad), y: CY + PILL_R * Math.sin(midRad), color: entry.g.color });
    });

    return { nodes, lines, pills };
  }, [entries]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div className="crystal-wrap">
        <div className="crystal-ball">
          <div className="crystal-highlight" />
          <svg width="300" height="300" style={{ position: "absolute", inset: 0 }}>
            {layout.lines.map((l) => (
              <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="1" strokeDasharray="2 4" opacity="0.55" />
            ))}
          </svg>
          <div className="moon-node" style={{ left: CX - 23, top: CY - 23 }} />
          {layout.nodes.map((n, i) => (
            <div
              key={i}
              className="star-node"
              style={{
                left: n.x,
                top: n.y,
                width: 6 + (n.score / 100) * 6,
                height: 6 + (n.score / 100) * 6,
                background: n.color,
                boxShadow: `0 0 ${4 + n.score / 10}px ${n.color}`,
              }}
              title={`${n.name} · ${n.score}점`}
            />
          ))}
          {layout.pills.map((p, i) => (
            <div key={i} className="constellation-pill badge-pill" style={{ left: p.x, top: p.y, fontSize: 10, padding: "3px 8px", borderColor: p.color }}>
              {p.label} {p.count}
            </div>
          ))}
        </div>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--text-caption)", textAlign: "center", maxWidth: 260 }}>
        달에 가까울수록, 별이 밝을수록
        <br />
        나와 케미가 좋은 사람이에요
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 16px" }}>
        {GROUP_META.map((g) => {
          const count = entries.filter((e) => chemiTier(e.score) === g.tier).length;
          return (
            <span key={g.tier} className="badge-pill" style={{ borderColor: g.color }}>
              {g.tier} {count}
            </span>
          );
        })}
      </div>
    </div>
  );
}
