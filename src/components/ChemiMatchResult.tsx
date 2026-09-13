import { Icon } from "@/components/primitives";
import { ScoreLink } from "@/components/TarotCard";
import type { CardBrief } from "@/types";

interface ChemiMatchResultProps {
  leftNickname: string;
  leftCard: CardBrief;
  leftReversed: boolean;
  rightNickname: string;
  rightCard: CardBrief;
  rightReversed: boolean;
  score: number;
  interpretation: string;
}

/** 두 사람의 케미 비교 결과(닉네임 배지 + 카드 두 장 + 점수 + 해석) — 방장/게스트 화면 모두에서 쓴다. */
export function ChemiMatchResult({
  leftNickname,
  leftCard,
  leftReversed,
  rightNickname,
  rightCard,
  rightReversed,
  score,
  interpretation,
}: ChemiMatchResultProps) {
  return (
    <>
      <span className="badge-pill">
        <Icon name="star" size={13} />
        {leftNickname} ✕ {rightNickname}
      </span>
      <ScoreLink
        score={score}
        left={{ name: leftCard.nameKr, imageUrl: leftCard.imageUrl, reversed: leftReversed }}
        right={{ name: rightCard.nameKr, imageUrl: rightCard.imageUrl, reversed: rightReversed }}
      />
      <div className="card-glass" style={{ padding: 20, width: "100%" }}>
        <p style={{ fontSize: "var(--text-body)", lineHeight: 1.6, color: "var(--text-secondary)" }}>{interpretation}</p>
      </div>
    </>
  );
}
