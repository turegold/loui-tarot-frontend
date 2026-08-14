"use client";

import { useRouter } from "next/navigation";
import { Blobs, DeckCardBack, KakaoButton, Starfield, TopBar } from "@/components/primitives";
import { kakaoLoginMock } from "@/api/mockApi";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar backHref="/" />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "40px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
        <DeckCardBack width={110} height={154} style={{ animation: "floatY 4s ease-in-out infinite" }} />
        <h2 style={{ fontSize: 26, marginTop: 4 }}>루이 타로</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>
          로그인하면 주제별 운세를 뽑고
          <br />
          기록으로 남길 수 있어요
        </p>
        <div style={{ flex: 1 }} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <KakaoButton
            onClick={async () => {
              // 실제 카카오 OAuth 연동 전까지는 mock 로그인으로 세션만 흉내낸다 (후속 작업)
              await kakaoLoginMock();
              router.push("/fortune/topic");
            }}
          >
            카카오로 시작하기
          </KakaoButton>
          <span style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>로그인 시 이용약관 및 개인정보 처리방침에 동의합니다</span>
        </div>
      </div>
    </div>
  );
}
