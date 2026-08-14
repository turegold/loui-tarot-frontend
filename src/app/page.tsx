import Link from "next/link";
import { Blobs, DeckCardBack, Icon, Starfield } from "@/components/primitives";

export default function LandingPage() {
  return (
    <div
      className="screen"
      style={{ background: "radial-gradient(120% 80% at 50% -10%, rgba(167,139,250,0.35), transparent), var(--bg-void)" }}
    >
      <Blobs />
      <Starfield />
      <div
        className="screen-scroll"
        style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 28px 40px", gap: 24, textAlign: "center" }}
      >
        <div className="badge-pill">
          <Icon name="sparkle" size={13} />
          오늘의 운세 · 궁합
        </div>
        <h1 style={{ fontSize: 34, lineHeight: 1.35, color: "var(--text-primary)" }}>
          카드 한 장으로
          <br />
          우리 둘의 케미를
          <br />
          확인해보세요
        </h1>
        <p style={{ fontSize: "var(--text-body)", color: "var(--text-secondary)", maxWidth: 300 }}>
          이름만 입력하고 카드를 뽑으면, 친구에게 공유해서 케미 궁합을 바로 확인할 수 있어요.
        </p>
        <DeckCardBack width={140} height={196} style={{ animation: "floatY 4s ease-in-out infinite", margin: "12px 0" }} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          <Link href="/chemi/new" className="btn-primary">
            <Icon name="sparkle" size={18} color="#fff" />
            케미 뽑으러 가기
          </Link>
          <Link href="/login" className="btn-ghost">
            카카오로 시작하기 (개인 카드 뽑기)
          </Link>
        </div>
      </div>
    </div>
  );
}
