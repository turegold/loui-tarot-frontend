import Link from "next/link";
import { notFound } from "next/navigation";
import { CARDS, getCardBySlug } from "@/data/cards";
import { mockGeneralInterpretation } from "@/api/mockApi";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { CardFace } from "@/components/TarotCard";
import type { Element } from "@/types";

const ELEMENT_LABEL: Record<Element, string> = { FIRE: "불", WATER: "물", AIR: "공기", EARTH: "흙" };

export function generateStaticParams() {
  return CARDS.map((c) => ({ slug: c.seoSlug }));
}

export default async function CardDetailPage({ params }: PageProps<"/card/[slug]">) {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) notFound();

  const upright = mockGeneralInterpretation(card, false);
  const reversed = mockGeneralInterpretation(card, true);
  const suitLabel = card.nameKr.split(" ")[0];

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar backHref="/" />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <CardFace name={card.nameKr} width={180} height={252} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <span className="badge-pill">{card.arcanaType === "MAJOR" ? `메이저 아르카나 ${card.number}` : `마이너 아르카나 · ${suitLabel}`}</span>
          {card.element && <span className="badge-pill">원소 · {ELEMENT_LABEL[card.element]}</span>}
        </div>
        <div className="card-glass" style={{ padding: 20, width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <h3 style={{ fontSize: "var(--text-subtitle)", marginBottom: 6 }}>정방향 의미</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{upright}</p>
          </div>
          <div>
            <h3 style={{ fontSize: "var(--text-subtitle)", marginBottom: 6 }}>역방향 의미</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-body)" }}>{reversed}</p>
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
