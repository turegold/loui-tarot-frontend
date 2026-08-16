"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { exchangeKakaoCode } from "@/api/client";
import { LoadingState } from "@/components/LoadingState";

/** 카카오 로그인 리다이렉트 도착 지점 — 인가코드를 백엔드에 넘겨 토큰을 발급받는다. */
function KakaoCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const ranRef = useRef(false); // 인가코드는 1회용이라, StrictMode/재렌더로 두 번 소모되는 걸 막는다
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || ranRef.current) return;
    ranRef.current = true;
    exchangeKakaoCode(code).then((res) => {
      if (res.success && res.data) {
        router.replace(res.data.isNewUser ? "/onboarding/nickname" : "/home");
        return;
      }
      setError(res.error?.message ?? "카카오 로그인에 실패했어요.");
    });
  }, [code, router]);

  if (!code || error) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", gap: 12 }}>
        <p style={{ color: "var(--text-secondary)" }}>{error ?? "카카오 로그인이 취소됐어요."}</p>
        <Link href="/" className="btn-text">
          다시 시도하기
        </Link>
      </div>
    );
  }

  return <LoadingState message="로그인하는 중이에요…" />;
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<LoadingState message="로그인하는 중이에요…" />}>
      <KakaoCallbackInner />
    </Suspense>
  );
}
