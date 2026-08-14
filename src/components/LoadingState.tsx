"use client";

import { useEffect } from "react";
import { Blobs, Icon, Starfield } from "./primitives";

interface LoadingStateProps {
  message?: string;
  onDone?: () => void;
  delayMs?: number;
}

/** 기존 디자인 킷의 ⑬ 로딩 화면 — 카드 뽑은 직후 AI 해석 대기 중에 공용으로 사용 */
export function LoadingState({ message = "AI가 카드를 해석하고 있어요…", onDone, delayMs = 1500 }: LoadingStateProps) {
  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, delayMs);
    return () => clearTimeout(t);
  }, [onDone, delayMs]);

  return (
    <div className="screen" style={{ justifyContent: "center", alignItems: "center" }}>
      <Blobs />
      <Starfield />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: 24 }}>
        <div style={{ animation: "pulseGlow 1.6s ease-in-out infinite" }}>
          <Icon name="sparkle" size={40} color="var(--lavender-300)" />
        </div>
        <div className="skeleton" style={{ width: 140, height: 196 }} />
        <div className="skeleton" style={{ width: 220, height: 14 }} />
        <div className="skeleton" style={{ width: 160, height: 14 }} />
        <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-caption)" }}>{message}</span>
      </div>
    </div>
  );
}
