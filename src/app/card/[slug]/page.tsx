import Link from "next/link";
import { notFound } from "next/navigation";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { CardFace } from "@/components/TarotCard";
import type { Card, CardDetail, Element } from "@/types";

const ELEMENT_LABEL: Record<Element, string> = { FIRE: "불", WATER: "물", AIR: "공기", EARTH: "흙" };

// 서버 컴포넌트(빌드 타임/요청 시 Node.js에서 실행)라 브라우저 전용 client.ts를 쓰지 않고 직접 fetch한다.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

async function fetchCards(): Promise<Card[]> {
  try {
    const res = await fetch(`${API_BASE}/cards`, { cache: "no-store" });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

async function fetchCardDetail(id: number): Promise<CardDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/cards/${id}`, { cache: "no-store" });
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
        <CardFace name={detail.nameKr} width={180} height={252} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <span className="badge-pill">{detail.arcanaType === "MAJOR" ? `메이저 아르카나 ${detail.number}` : `마이너 아르카나 · ${suitLabel}`}</span>
          {detail.element && <span className="badge-pill">원소 · {ELEMENT_LABEL[detail.element]}</span>}
        </div>
        <div className="card-glass" style={{ padding: 20, width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <h3 style={{ fontSize: "var(--text-subtitle)", marginBottom: 6 }}>정방향 의미</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.uprightInterpretation}</p>
          </div>
          <div>
            <h3 style={{ fontSize: "var(--text-subtitle)", marginBottom: 6 }}>역방향 의미</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{detail.reversedInterpretation}</p>
          </div>
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
