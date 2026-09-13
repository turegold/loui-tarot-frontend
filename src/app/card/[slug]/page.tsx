import http from "node:http";
import https from "node:https";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blobs, Icon, Starfield, TopBar } from "@/components/primitives";
import { CardFace } from "@/components/TarotCard";
import { CARDS, getCardBySlug } from "@/data/cards";
import type { CardDetail, Element } from "@/types";

const ELEMENT_LABEL: Record<Element, string> = { FIRE: "불", WATER: "물", AIR: "공기", EARTH: "흙" };

// 서버 컴포넌트(빌드 타임/요청 시 Node.js에서 실행)라 브라우저 전용 client.ts를 쓰지 않고 직접 fetch한다.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

// 78장 카드 목록(id/nameKr/seoSlug 등)은 로컬 카탈로그(@/data/cards)가 백엔드 시드와 완전히
// 동일한 값을 만들어내므로, 슬러그↔ID 매핑에는 네트워크가 전혀 필요 없다. 실제 API는
// 카드별 해석 텍스트(fetchCardDetail)를 가져올 때만 부른다.

// Node의 전역 fetch(undici)로 api.watchy.site(Nginx+Let's Encrypt, TLS 1.3)에 붙으면
// ERR_SSL_DECRYPTION_FAILED_OR_BAD_RECORD_MAC로 100% 재현되는 게 확인됐다 — 동시성/재시도
// 문제가 아니라 순차 요청 1건도 실패했고, curl이나 같은 호스트의 다른 정적 파일(CloudFront)은
// 멀쩡했다. TLS 1.2로 강제하면 즉시 해결되는 것도 확인했다 — Node fetch(undici)와 이
// 서버의 TLS 1.3 협상 사이의 호환성 문제로 보인다. 이 빌드는 로컬뿐 아니라 GitHub Actions
// CI에서도 똑같이 이 백엔드로 붙으므로, Nginx 쪽에서 TLS 1.3을 끄는 대신(실사용자 브라우저
// 트래픽까지 영향) 이 빌드 스크립트만 TLS 1.2로 붙게 한다.
function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https:");
    const client = isHttps ? https : http;
    const options = isHttps ? { maxVersion: "TLSv1.2" as const } : {};
    client
      .get(url, options, (res) => {
        if (!res.statusCode || res.statusCode >= 400) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function fetchCardDetail(id: number): Promise<CardDetail | null> {
  try {
    const body = (await fetchJson(`${API_BASE}/cards/${id}`)) as { data?: CardDetail };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return CARDS.map((c) => ({ slug: c.seoSlug }));
}

// 카드마다 다른 title/description을 줘야 검색엔진이 78개 페이지를 서로 다른 콘텐츠로 본다 —
// 전부 같은 제목이면 사실상 중복 페이지로 취급될 수 있다.
export async function generateMetadata({ params }: PageProps<"/card/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const summary = getCardBySlug(slug);
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
  const summary = getCardBySlug(slug);
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
