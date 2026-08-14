import type { Card, Element, Suit } from "@/types";

const MAJOR_ARCANA: { nameKr: string; nameEn: string }[] = [
  { nameKr: "바보", nameEn: "The Fool" },
  { nameKr: "마법사", nameEn: "The Magician" },
  { nameKr: "여사제", nameEn: "The High Priestess" },
  { nameKr: "여황제", nameEn: "The Empress" },
  { nameKr: "황제", nameEn: "The Emperor" },
  { nameKr: "교황", nameEn: "The Hierophant" },
  { nameKr: "연인", nameEn: "The Lovers" },
  { nameKr: "전차", nameEn: "The Chariot" },
  { nameKr: "힘", nameEn: "Strength" },
  { nameKr: "은둔자", nameEn: "The Hermit" },
  { nameKr: "운명의 수레바퀴", nameEn: "Wheel of Fortune" },
  { nameKr: "정의", nameEn: "Justice" },
  { nameKr: "매달린 사람", nameEn: "The Hanged Man" },
  { nameKr: "죽음", nameEn: "Death" },
  { nameKr: "절제", nameEn: "Temperance" },
  { nameKr: "악마", nameEn: "The Devil" },
  { nameKr: "탑", nameEn: "The Tower" },
  { nameKr: "별", nameEn: "The Star" },
  { nameKr: "달", nameEn: "The Moon" },
  { nameKr: "태양", nameEn: "The Sun" },
  { nameKr: "심판", nameEn: "Judgement" },
  { nameKr: "세계", nameEn: "The World" },
];

const SUITS: { suit: Suit; nameKr: string; nameEn: string; element: Element }[] = [
  { suit: "WAND", nameKr: "완드", nameEn: "Wands", element: "FIRE" },
  { suit: "CUP", nameKr: "컵", nameEn: "Cups", element: "WATER" },
  { suit: "SWORD", nameKr: "소드", nameEn: "Swords", element: "AIR" },
  { suit: "PENTACLE", nameKr: "펜타클", nameEn: "Pentacles", element: "EARTH" },
];

const RANKS: { n: number; nameKr: string; nameEn: string }[] = [
  { n: 1, nameKr: "에이스", nameEn: "Ace" },
  { n: 2, nameKr: "2", nameEn: "2" },
  { n: 3, nameKr: "3", nameEn: "3" },
  { n: 4, nameKr: "4", nameEn: "4" },
  { n: 5, nameKr: "5", nameEn: "5" },
  { n: 6, nameKr: "6", nameEn: "6" },
  { n: 7, nameKr: "7", nameEn: "7" },
  { n: 8, nameKr: "8", nameEn: "8" },
  { n: 9, nameKr: "9", nameEn: "9" },
  { n: 10, nameKr: "10", nameEn: "10" },
  { n: 11, nameKr: "페이지", nameEn: "Page" },
  { n: 12, nameKr: "나이트", nameEn: "Knight" },
  { n: 13, nameKr: "퀸", nameEn: "Queen" },
  { n: 14, nameKr: "킹", nameEn: "King" },
];

function slugify(en: string) {
  return en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildCards(): Card[] {
  const cards: Card[] = [];
  let id = 1;

  MAJOR_ARCANA.forEach((m, i) => {
    cards.push({
      id: id++,
      nameKr: m.nameKr,
      nameEn: m.nameEn,
      arcanaType: "MAJOR",
      suit: null,
      element: null,
      number: i,
      seoSlug: slugify(m.nameEn),
    });
  });

  SUITS.forEach(({ suit, nameKr: suitNameKr, nameEn: suitNameEn, element }) => {
    RANKS.forEach((r) => {
      cards.push({
        id: id++,
        nameKr: `${suitNameKr} ${r.nameKr}`,
        nameEn: `${r.nameEn} of ${suitNameEn}`,
        arcanaType: "MINOR",
        suit,
        element,
        number: r.n,
        seoSlug: slugify(`${r.nameEn}-of-${suitNameEn}`),
      });
    });
  });

  return cards;
}

/** RWS 78장 시드 데이터 (22 메이저 + 4수트 x 14랭크 마이너) */
export const CARDS: Card[] = buildCards();

export function getCardById(id: number): Card | undefined {
  return CARDS.find((c) => c.id === id);
}

export function getCardBySlug(slug: string): Card | undefined {
  return CARDS.find((c) => c.seoSlug === slug);
}

export function randomCard(): { card: Card; isReversed: boolean } {
  const card = CARDS[Math.floor(Math.random() * CARDS.length)];
  return { card, isReversed: Math.random() < 0.5 };
}
