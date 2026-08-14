import type { Card, Element } from "@/types";

// 케미 점수 산출 로직.md — 규칙 기반, 결정론적 계산

const FRIENDLY_PAIRS: [Element, Element][] = [
  ["FIRE", "AIR"],
  ["WATER", "EARTH"],
];
const OPPOSING_PAIRS: [Element, Element][] = [
  ["FIRE", "WATER"],
  ["AIR", "EARTH"],
];

function includesPair(pairs: [Element, Element][], a: Element, b: Element) {
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

/** ① 원소 궁합 — 마이너 아르카나끼리만 적용 (메이저는 원소가 없음) */
function elementScore(a: Element | null, b: Element | null): number {
  if (!a || !b) return 0;
  if (a === b) return 15;
  if (includesPair(FRIENDLY_PAIRS, a, b)) return 20;
  if (includesPair(OPPOSING_PAIRS, a, b)) return -20;
  return 0; // 중립 (불-흙, 물-공)
}

/** ② 메이저/마이너 아르카나 */
function arcanaScore(a: Card, b: Card): number {
  const majors = [a, b].filter((c) => c.arcanaType === "MAJOR").length;
  if (majors === 2) return 10;
  if (majors === 1) return 5;
  return 0;
}

/** ③ 정방향/역방향 */
function directionScore(aReversed: boolean, bReversed: boolean): number {
  if (!aReversed && !bReversed) return 15;
  if (aReversed && bReversed) return -10;
  return -5;
}

export interface ChemiScoreInput {
  cardA: Card;
  isReversedA: boolean;
  cardB: Card;
  isReversedB: boolean;
}

/** 기본 50점에서 가점/감점 합산 후 0~100 클램프 */
export function calculateChemiScore({ cardA, isReversedA, cardB, isReversedB }: ChemiScoreInput): number {
  let score = 50;
  score += elementScore(cardA.element, cardB.element);
  score += arcanaScore(cardA, cardB);
  score += directionScore(isReversedA, isReversedB);
  return Math.max(0, Math.min(100, score));
}

export type ChemiTier = "천생연분" | "잘 맞음" | "무난" | "노력 필요" | "상극";

export function chemiTier(score: number): ChemiTier {
  if (score >= 90) return "천생연분";
  if (score >= 70) return "잘 맞음";
  if (score >= 50) return "무난";
  if (score >= 30) return "노력 필요";
  return "상극";
}
