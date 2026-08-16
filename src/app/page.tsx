"use client";

import { Blobs, DeckCardBack, KakaoButton, Starfield } from "@/components/primitives";

function kakaoLoginUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
  return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri ?? "")}&response_type=code`;
}

export default function OnboardingPage() {
  return (
    <div
      className="screen"
      style={{ background: "radial-gradient(120% 80% at 50% -10%, rgba(167,139,250,0.35), transparent), var(--bg-void)" }}
    >
      <Blobs />
      <Starfield />
      <div
        className="screen-scroll"
        style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 28px 40px", gap: 24, textAlign: "center" }}
      >
        <DeckCardBack width={140} height={196} style={{ animation: "floatY 4s ease-in-out infinite" }} />
        <h1 style={{ fontSize: 30, color: "var(--text-primary)" }}>루이 타로</h1>
        <p style={{ fontSize: "var(--text-body)", color: "var(--text-secondary)", maxWidth: 300 }}>
          카드 한 장으로 오늘의 운세와 우리 둘의 케미를 확인해보세요.
        </p>
        <div style={{ flex: 1 }} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <KakaoButton onClick={() => window.location.assign(kakaoLoginUrl())}>카카오로 시작하기</KakaoButton>
          <span style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>로그인 시 이용약관 및 개인정보 처리방침에 동의합니다</span>
        </div>
      </div>
    </div>
  );
}
