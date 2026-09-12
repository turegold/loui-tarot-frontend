import { Twinkles } from "./primitives";

export interface CardFaceData {
  name?: string;
  imageUrl?: string;
  reversed?: boolean;
}

interface CardFaceProps extends CardFaceData {
  width?: number;
  compact?: boolean;
}

/**
 * 실제 카드 이미지 원본 비율(가로/세로, 약 1109:1920) — width만 받고 height는 여기서 유도한다.
 * 카드마다 촬영 비율이 조금씩 달라서(0.573~0.596) 이 값과 완전히 일치하진 않는데, 그 오차는
 * objectFit "contain"이 잘림 없이 여백으로 흡수한다 — 이 상수는 그 여백을 최소화하는 용도.
 */
const CARD_ASPECT_RATIO = 0.578;

/**
 * imageUrl이 없으면 .card-art-placeholder 그라데이션을 임시 아트워크로 사용한다.
 * (카드 뒷면 아트 .deck-card-back과는 별개 — 이건 "앞면 미확보"용 플레이스홀더)
 */
export function CardFace({ name, imageUrl, reversed, width = 160, compact }: CardFaceProps) {
  const height = Math.round(width / CARD_ASPECT_RATIO);
  return (
    <div style={{ width, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        className="card-glass"
        style={{ width, height, padding: 6, overflow: "hidden", transform: reversed ? "rotate(180deg)" : "none" }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 실제 카드 에셋 소싱 전까지 임시
          <img
            src={imageUrl}
            alt={name ?? "타로 카드"}
            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 16 }}
          />
        ) : (
          <div className="card-art-placeholder" style={{ width: "100%", height: "100%" }}>
            <Twinkles />
          </div>
        )}
      </div>
      {!compact && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-subtitle)" }}>{name}</span>
          {reversed ? <span className="badge-pill">역방향</span> : null}
        </div>
      )}
    </div>
  );
}

interface ScoreLinkProps {
  score?: number;
  left?: CardFaceData;
  right?: CardFaceData;
}
export function ScoreLink({ score = 76, left, right }: ScoreLinkProps) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, padding: "20px 0" }}>
      <CardFace compact width={128} {...left} />
      <svg width="70" height="4" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 0 }}>
        <line x1="0" y1="2" x2="70" y2="2" stroke="var(--lavender-300)" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.8" />
      </svg>
      <div className="score-badge">
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--lavender-100)" }}>{score}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>케미 스코어</span>
      </div>
      <CardFace compact width={128} {...right} />
    </div>
  );
}
