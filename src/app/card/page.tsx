import type { Metadata } from "next";
import Link from "next/link";
import { Blobs, Starfield, TopBar } from "@/components/primitives";
import type { Card, Suit } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

// 이 페이지는 동적 세그먼트가 없어 정적 export 시 "완전히 정적인 페이지"로 취급된다 —
// { cache: "no-store" }(=revalidate:0)를 쓰면 "항상 새로 가져와야 함"이 되어 정적 렌더링
// 자체와 충돌해 빌드가 실패한다(NEXT_STATIC_GEN_BAILOUT). 빌드 타임에 한 번만 가져오면
// 되므로 기본 캐싱 그대로 둔다.
async function fetchCards(): Promise<Card[]> {
  try {
    const res = await fetch(`${API_BASE}/cards`);
    if (!res.ok) return [];
    const body = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

const SUIT_LABEL: Record<Suit, string> = { WAND: "완드", CUP: "컵", SWORD: "소드", PENTACLE: "펜타클" };
const SUIT_ORDER: Suit[] = ["WAND", "CUP", "SWORD", "PENTACLE"];

export const metadata: Metadata = {
  title: "타로 카드 78장 사전 - 정방향/역방향 의미",
  description: "메이저 아르카나 22장과 마이너 아르카나 56장, 타로 카드 78장 전체의 정방향·역방향 의미와 연애운·취업운·재물운 해석을 확인해보세요.",
};

function CardLink({ card }: { card: Card }) {
  return (
    <Link href={`/card/${card.seoSlug}`} className="progress-list-row" style={{ textDecoration: "none", color: "inherit" }}>
      <span style={{ fontSize: "var(--text-body)" }}>{card.nameKr}</span>
    </Link>
  );
}

export default async function CardIndexPage() {
  const cards = await fetchCards();
  const majors = cards.filter((c) => c.arcanaType === "MAJOR").sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar backHref="/" />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 24px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>타로 카드 사전</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", marginTop: 6 }}>
            카드를 눌러 정방향·역방향 의미와 연애운·취업운·재물운 해석을 확인해보세요.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: "var(--text-subtitle)", marginBottom: 10 }}>메이저 아르카나 · {majors.length}장</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {majors.map((c) => (
              <CardLink key={c.id} card={c} />
            ))}
          </div>
        </div>

        {SUIT_ORDER.map((suit) => {
          const suitCards = cards
            .filter((c) => c.arcanaType === "MINOR" && c.suit === suit)
            .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
          if (suitCards.length === 0) return null;
          return (
            <div key={suit}>
              <h2 style={{ fontSize: "var(--text-subtitle)", marginBottom: 10 }}>
                마이너 아르카나 · {SUIT_LABEL[suit]} · {suitCards.length}장
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {suitCards.map((c) => (
                  <CardLink key={c.id} card={c} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
