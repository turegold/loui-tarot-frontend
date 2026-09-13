import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "루이 타로";
const description = "카드를 뽑고 친구와 케미까지 확인해보세요";

export const metadata: Metadata = {
  // opengraph-image.png/twitter-image.png의 상대 경로를 카카오톡 등 외부 크롤러가 요구하는
  // 절대 URL로 바꾸는 데 필요하다 — 없으면 빌드 시 경고가 뜨고 이미지가 안 붙는다.
  metadataBase: new URL("https://www.watchy.site"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://www.watchy.site",
    siteName: title,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0812",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
