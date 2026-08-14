"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Blobs, PrimaryButton, Starfield, TextInput } from "@/components/primitives";
import { getCurrentUser, updateMe } from "@/api/mockApi";

/** 최초 카카오 로그인 시 1회 노출 — 카카오 프로필 닉네임을 그대로 쓸지, 바꿀지 확인하는 화면 */
export default function OnboardingNicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setNickname(user.nickname);
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "80px 24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontSize: 26 }}>
          어떤 이름으로
          <br />
          불러드릴까요?
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>카카오 프로필 닉네임으로 채워뒀어요. 마음에 안 들면 바꿔도 돼요.</p>
        <TextInput value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={30} />
        <div style={{ flex: 1 }} />
        <PrimaryButton
          disabled={!nickname.trim() || saving}
          onClick={async () => {
            setSaving(true);
            await updateMe(nickname.trim());
            router.push("/home");
          }}
        >
          완료
        </PrimaryButton>
      </div>
    </div>
  );
}
