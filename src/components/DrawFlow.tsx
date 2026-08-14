"use client";

import { useState } from "react";
import { Blobs, DeckCardBack, PrimaryButton, Starfield, TextInput, TopBar } from "./primitives";
import { LoadingState } from "./LoadingState";

type Step = "name" | "draw" | "loading";

interface DrawFlowProps {
  description?: string;
  drawHint: string;
  onBack?: () => void;
  /** 로그인된 방장 흐름처럼 이름을 이미 알고 있을 때 이름 입력 단계를 건너뛴다 */
  skipNameStep?: boolean;
  /** 카드를 고른 직후 호출됨. 실패 시 에러 메시지를 반환하면 이전 단계로 되돌아간다. 성공 시 라우팅은 호출자가 담당. */
  onSubmit: (name: string) => Promise<string | void>;
}

/** ②이름 입력 + ③카드 뽑기 화면 — 방장(케미 뽑기)과 게스트 뽑기가 동일 구조라 공용 컴포넌트로 뺐다 */
export function DrawFlow({ description, drawHint, onBack, skipNameStep, onSubmit }: DrawFlowProps) {
  const [step, setStep] = useState<Step>(skipNameStep ? "draw" : "name");
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(i: number) {
    setPicked(i);
    setStep("loading");
    const errorMessage = await onSubmit(name.trim());
    if (errorMessage) {
      setError(errorMessage);
      setStep(skipNameStep ? "draw" : "name");
      setPicked(null);
    }
  }

  if (step === "loading") return <LoadingState />;

  if (step === "draw") {
    return (
      <div className="screen">
        <Blobs />
        <Starfield />
        <TopBar onBack={skipNameStep ? onBack : () => setStep("name")} />
        <div
          className="screen-scroll"
          style={{ position: "relative", zIndex: 1, padding: "10px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}
        >
          <h2 style={{ fontSize: 24, marginTop: 12 }}>
            마음이 가는
            <br />
            카드 한 장을 골라보세요
          </h2>
          <div style={{ display: "flex", position: "relative", height: 220, alignItems: "center" }}>
            {[-14, 0, 14].map((rot, i) => (
              <div
                key={i}
                onClick={() => handlePick(i)}
                style={{
                  marginLeft: i === 0 ? 0 : -30,
                  transform: `rotate(${rot}deg) ${picked === i ? "translateY(-14px) scale(1.06)" : ""}`,
                  transition: "transform .3s",
                  zIndex: picked === i ? 3 : 1,
                  cursor: "pointer",
                }}
              >
                <DeckCardBack width={120} height={168} />
              </div>
            ))}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-caption)" }}>{drawHint}</p>
          {error && <p style={{ color: "var(--pink-accent)", fontSize: "var(--text-caption)" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar onBack={onBack} />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontSize: 26, marginTop: 20 }}>어떻게 불러드릴까요?</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>{description}</p>
        <TextInput placeholder="이름 또는 별명" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />
        {error && <p style={{ color: "var(--pink-accent)", fontSize: "var(--text-caption)" }}>{error}</p>}
        <div style={{ flex: 1 }} />
        <PrimaryButton disabled={!name.trim()} onClick={() => setStep("draw")}>
          카드 뽑으러 가기
        </PrimaryButton>
      </div>
    </div>
  );
}
