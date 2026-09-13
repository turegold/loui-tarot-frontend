import type { MetadataRoute } from "next";
import { CARDS } from "@/data/cards";

const BASE_URL = "https://www.watchy.site";

// output: export는 sitemap.xml 같은 특수 라우트 핸들러도 정적으로 고정해야 한다.
export const dynamic = "force-static";

// 카드 목록은 네트워크 요청 없이 로컬 카탈로그(@/data/cards)로 뽑는다 — /card/[slug]에서
// 겪은 것과 같은 이유(정적 export에서의 fetch 관련 문제, 빌드 안정성)로 여기서도 굳이
// 백엔드를 호출할 필요가 없다.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/card`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const cardPages: MetadataRoute.Sitemap = CARDS.map((c) => ({
    url: `${BASE_URL}/card/${c.seoSlug}`,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticPages, ...cardPages];
}
