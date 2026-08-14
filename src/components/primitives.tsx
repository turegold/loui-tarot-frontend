"use client";

import Link from "next/link";
import { useMemo, type CSSProperties, type InputHTMLAttributes, type ReactNode } from "react";

const ICONS: Record<string, string> = {
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  share: "M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7 M16 6l-4-4-4 4 M12 2v14",
  heart: "M12 21s-7.5-4.6-10-9.1C.5 8.4 2.4 5 6 5c2 0 3.4 1 6 3.6C14.6 6 16 5 18 5c3.6 0 5.5 3.4 4 6.9C19.5 16.4 12 21 12 21z",
  briefcase: "M3 7h18v12H3V7z M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2",
  coin: "M12 3v18 M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 1 0 10.5 10.5z",
  sparkle: "M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2z",
  check: "M4 12l5 5 11-11",
  clock: "M12 7v5l3 2 M12 21a9 9 0 100-18 9 9 0 000 18z",
  list: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  crown: "M3 8l3 3 6-7 6 7 3-3-2 12H5L3 8z",
  star: "M12 2l3 7 7 1-5.2 5 1.3 7-6.1-3.6L5.9 22l1.3-7L2 10l7-1 3-7z",
};

/** SSR/CSR에서 동일한 값을 내도록 하는 결정론적 pseudo-random (0~1). Math.random()은 하이드레이션 불일치를 일으킴. */
export function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * 소수점을 적당히 잘라 반환한다. 브라우저는 style 속성을 HTML로 직렬화했다가 다시 파싱하면서
 * CSS 값의 유효자릿수를 줄여버리는데(예: 92.16903898159217% → 92.169%), pseudoRandom의
 * 풀 정밀도 값을 그대로 style에 넣으면 서버 렌더링 값과 하이드레이션 시 문자열이 달라져
 * "hydration mismatch" 경고가 뜬다. 애초에 별 위치처럼 시각적 정밀도가 필요 없는 값이므로 반올림한다.
 */
function round(n: number, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}
export function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.8 }: IconProps) {
  const d = ICONS[name] || ICONS.star;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  /** 서버 컴포넌트 페이지에서는 onBack(함수)을 넘길 수 없으니 링크로 뒤로가기를 표현할 때 사용 */
  backHref?: string;
  right?: ReactNode;
}
export function TopBar({ title, onBack, backHref, right }: TopBarProps) {
  return (
    <div className="topbar">
      {backHref ? (
        <Link href={backHref} className="iconbtn" aria-label="뒤로가기">
          <Icon name="chevronLeft" />
        </Link>
      ) : onBack ? (
        <button className="iconbtn" onClick={onBack} aria-label="뒤로가기">
          <Icon name="chevronLeft" />
        </button>
      ) : (
        <div style={{ width: 44 }} />
      )}
      {title ? <span className="topbar-title">{title}</span> : null}
      <div style={{ marginLeft: "auto" }}>{right}</div>
    </div>
  );
}

interface StarfieldProps {
  count?: number;
}
export function Starfield({ count = 22 }: StarfieldProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: round(pseudoRandom(i * 3.1 + 1) * 100),
        top: round(pseudoRandom(i * 7.7 + 2) * 100),
        size: round(1 + pseudoRandom(i * 5.3 + 3) * 2),
        delay: round(pseudoRandom(i * 9.1 + 4) * 3),
      })),
    [count]
  );
  return (
    <div className="stars">
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.left + "%",
            top: s.top + "%",
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: s.delay + "s",
          }}
        />
      ))}
    </div>
  );
}

export function Blobs() {
  return (
    <>
      <div className="blob" style={{ width: 260, height: 260, left: -80, top: -60, background: "var(--lavender-500)" }} />
      <div className="blob" style={{ width: 220, height: 220, right: -70, top: 220, background: "var(--pink-accent)", opacity: 0.25 }} />
      <div className="blob" style={{ width: 240, height: 240, left: -60, bottom: -80, background: "var(--blue-accent)", opacity: 0.2 }} />
    </>
  );
}

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: string;
}
export function PrimaryButton({ children, onClick, disabled, icon }: ButtonProps) {
  return (
    <button className="btn-primary" onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={18} color="#fff" />}
      {children}
    </button>
  );
}
export function GhostButton({ children, onClick }: ButtonProps) {
  return (
    <button className="btn-ghost" onClick={onClick}>
      {children}
    </button>
  );
}
export function KakaoButton({ children, onClick }: ButtonProps) {
  return (
    <button className="btn-kakao" onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.8-.2.7-.8 2.7-.9 3.1-.1.5.2.5.4.4.2-.1 2.9-1.9 4-2.7.6.1 1.2.1 1.8.1 5.5 0 10-3.6 10-8s-4.5-8-10-8z"
          fill="#191600"
        />
      </svg>
      {children}
    </button>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input-field" {...props} />;
}

interface TopicCardProps {
  icon: string;
  title: string;
  desc: string;
  selected?: boolean;
  onClick?: () => void;
}
export function TopicCard({ icon, title, desc, selected, onClick }: TopicCardProps) {
  return (
    <button className={"topic-card" + (selected ? " selected" : "")} onClick={onClick}>
      <div className="topic-icon">
        <Icon name={icon} size={20} color="#fff" />
      </div>
      <span style={{ fontSize: "var(--text-subtitle)", fontFamily: "var(--font-display)" }}>{title}</span>
      <span style={{ fontSize: "var(--text-caption)", color: "var(--text-secondary)" }}>{desc}</span>
    </button>
  );
}

interface TwinklesProps {
  n?: number;
}
export function Twinkles({ n = 6 }: TwinklesProps) {
  const pts = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        l: round(10 + pseudoRandom(i * 4.4 + 11) * 80),
        t: round(10 + pseudoRandom(i * 6.6 + 12) * 80),
        s: round(2 + pseudoRandom(i * 8.8 + 13) * 2),
      })),
    [n]
  );
  return (
    <>
      {pts.map((p, i) => (
        <div
          key={i}
          className="twinkle"
          style={{ left: p.l + "%", top: p.t + "%", width: p.s, height: p.s, animation: `twinkle ${1.5 + i * 0.3}s ease-in-out infinite` }}
        />
      ))}
    </>
  );
}

interface DeckCardBackProps {
  width?: number;
  height?: number;
  style?: CSSProperties;
}
export function DeckCardBack({ width = 120, height = 168, style }: DeckCardBackProps) {
  return (
    <div className="deck-card-back" style={{ width, height, ...style }}>
      <Twinkles />
    </div>
  );
}
