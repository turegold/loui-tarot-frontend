import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { CardFace } from "@/components/TarotCard";
import type { Card, CardDetail, Element } from "@/types";

const ELEMENT_LABEL: Record<Element, string> = { FIRE: "불", WATER: "물", AIR: "공기", EARTH: "흙" };

// 서버 컴포넌트(빌드 타임/요청 시 Node.js에서 실행)라 브라우저 전용 client.ts를 쓰지 않고 직접 fetch한다.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

// 정적 export에서 이 라우트는 generateStaticParams로 이미 완전히 정적이라 { cache: "no-store" }
// (=revalidate:0, "항상 새로 가져와야 함")를 쓰면 특히 generateMetadata 안에서 정적 렌더링과
// 충돌해 빌드가 실패한다(NEXT_STATIC_GEN_BAILOUT). 빌드 타임에 한 번만 가져오면 되므로
// 기본 캐싱 그대로 둔다.
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

async function fetchCardDetail(id: number): Promise<CardDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/cards/${id}`);
    if (!res.ok) return null;
    const body = await res.json();
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const cards = await fetchCards();
  return cards.map((c) => ({ slug: c.seoSlug }));
}

// 카드마다 다른 title/description을 줘야 검색엔진이 78개 페이지를 서로 다른 콘텐츠로 본다 —
// 전부 같은 제목이면 사실상 중복 페이지로 취급될 수 있다.
export async function generateMetadata({ params }: PageProps<"/card/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cards = await fetchCards();
  const summary = cards.find((c) => c.seoSlug === slug);
  if (!summary) return {};

  const title = `${summary.nameKr} 카드 의미 - 정방향/역방향 해석`;
  const description = `${summary.nameKr}(${summary.nameEn}) 카드의 정방향·역방향 의미와 연애운·취업운·재물운 해석. 루이 타로에서 무료로 확인해보세요.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function CardDetailPage({ params }: PageProps<"/card/[slug]">) {
  const { slug } = await params;
  const cards = await fetchCards();
  const summary = cards.find((c) => c.seoSlug === slug);
  if (!summary) notFound();

  const detail = await fetchCardDetail(summary.id);
  if (!detail) notFound();

  const suitLabel = detail.nameKr.split(" ")[0];

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar backHref="/" />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <CardFace name={detail.nameKr} imageUrl={detail.imageUrl} width={180} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <span className="badge-pill">{detail.arcanaType === "MAJOR" ? `메이저 아르카나 ${detail.number}` : `마이너 아르카나 · ${suitLabel}`}</span>
          {detail.element && <span className="badge-pill">원소 · {ELEMENT_LABEL[detail.element]}</span>}
        </div>
        <div className="card-glass" style={{ padding: 20, width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="badge-pill" style={{ alignSelf: "flex-start" }}>
            정방향 · 핵심 키워드 {detail.uprightKeyword}
          </span>
          <h3 style={{ fontSize: "var(--text-subtitle)", marginTop: 6 }}>정방향 의미</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.uprightInterpretation}</p>
          <h3 style={{ fontSize: "var(--text-subtitle)", marginTop: 6 }}>정방향 연애운</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.uprightLoveInterpretation}</p>
          <h3 style={{ fontSize: "var(--text-subtitle)", marginTop: 6 }}>정방향 취업운</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.uprightCareerInterpretation}</p>
          <h3 style={{ fontSize: "var(--text-subtitle)", marginTop: 6 }}>정방향 재물운</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.uprightWealthInterpretation}</p>
        </div>

        <div className="card-glass" style={{ padding: 20, width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="badge-pill" style={{ alignSelf: "flex-start" }}>
            역방향 · 핵심 키워드 {detail.reversedKeyword}
          </span>
          <h3 style={{ fontSize: "var(--text-subtitle)", marginTop: 6 }}>역방향 의미</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.reversedInterpretation}</p>
          <h3 style={{ fontSize: "var(--text-subtitle)", marginTop: 6 }}>역방향 연애운</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.reversedLoveInterpretation}</p>
          <h3 style={{ fontSize: "var(--text-subtitle)", marginTop: 6 }}>역방향 취업운</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.reversedCareerInterpretation}</p>
          <h3 style={{ fontSize: "var(--text-subtitle)", marginTop: 6 }}>역방향 재물운</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.reversedWealthInterpretation}</p>
        </div>

        <div style={{ width: "100%" }}>
          <Link href="/chemi/new" className="btn-primary">
            <Icon name="sparkle" size={18} color="#fff" />
            케미 뽑으러 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
