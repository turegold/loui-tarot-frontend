import type { Metadata } from "next";
import { Blobs, Starfield, TopBar } from "@/components/primitives";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "루이 타로 개인정보 처리방침",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h2 style={{ fontSize: "var(--text-subtitle)" }}>{title}</h2>
      <div style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar backHref="/" />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "0 24px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>개인정보 처리방침</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-caption)", marginTop: 6 }}>시행일: 2026년 9월 13일</p>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", lineHeight: 1.7 }}>
          루이 타로(이하 &quot;서비스&quot;)를 운영하는 개인 운영자(이하 &quot;운영자&quot;)는 이용자의 개인정보를 소중히 다루며, 「개인정보 보호법」 등
          관련 법령을 준수합니다. 본 개인정보 처리방침은 서비스 이용 시 수집되는 개인정보의 항목, 수집 목적, 보유 기간 등을 안내합니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목">
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>카카오 로그인 시: 카카오 회원번호, 닉네임, 프로필 이미지 URL</li>
            <li>로그인 없이 게스트로 케미 뽑기에 참여 시: 직접 입력한 닉네임(최대 6자)</li>
            <li>서비스 이용 과정에서 자동으로 생성: 뽑기 결과(카드, 해석 텍스트, 생성 일시)</li>
            <li>부정 이용 방지를 위한 IP 주소의 해시값(SHA-256으로 변환된 값으로, 원래 IP 주소로 되돌릴 수 없어 개인을 식별하는 데 사용되지 않습니다)</li>
          </ul>
          <p style={{ marginTop: 8 }}>이메일, 전화번호, 생년월일 등은 수집하지 않습니다.</p>
        </Section>

        <Section title="2. 개인정보의 수집 및 이용 목적">
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>카카오 로그인을 통한 회원 식별 및 서비스 제공</li>
            <li>케미 뽑기·개인 카드 뽑기 결과 등 서비스 이용 기록 제공(마이페이지)</li>
            <li>부정 이용(어뷰징) 방지</li>
          </ul>
        </Section>

        <Section title="3. 개인정보의 보유 및 이용 기간">
          <p>
            이용자의 개인정보는 원칙적으로 서비스 이용 기간 동안 보유합니다. 이용자가 아래 문의처로 삭제를 요청하면 지체 없이 파기하며, 관계
            법령에 따라 별도로 보존해야 하는 경우 해당 기간 동안만 보관합니다.
          </p>
        </Section>

        <Section title="4. 개인정보의 제3자 제공 및 위탁">
          <p>
            운영자는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 카카오 로그인 인증을 위해 카카오(주)에 필요한 최소한의 정보가
            전달되며, 이는 카카오의 개인정보 처리방침을 따릅니다. 서비스 서버는 Amazon Web Services(AWS)의 인프라 위에서 운영됩니다.
          </p>
        </Section>

        <Section title="5. 쿠키 및 광고">
          <p>
            서비스는 Google AdSense, 카카오 애드핏 등 제3자 광고 서비스를 통해 광고를 게재할 수 있습니다. 이들 광고 서비스는 이용자에게 맞춤형
            광고를 제공하기 위해 쿠키를 사용해 이 사이트 및 다른 사이트 방문 이력을 참고할 수 있습니다. 이용자는{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lavender-200)" }}
            >
              Google 광고 설정
            </a>
            에서 맞춤형 광고를 비활성화할 수 있습니다.
          </p>
        </Section>

        <Section title="6. 브라우저 저장소 이용">
          <p>
            서비스는 로그인 유지, 뽑은 케미 링크 관리 등을 위해 이용자 브라우저의 로컬 저장소(localStorage)에 접근 토큰과 관련 정보를
            저장합니다. 이 정보는 이용자의 브라우저에만 저장되며 운영자의 서버로 전송되지 않습니다. 브라우저 설정에서 언제든지 삭제할 수
            있습니다.
          </p>
        </Section>

        <Section title="7. 이용자의 권리">
          <p>
            이용자는 언제든지 아래 문의처로 연락하여 본인의 개인정보 열람, 정정, 삭제를 요청할 수 있습니다. 마이페이지에서 닉네임은 직접 수정할
            수 있습니다.
          </p>
        </Section>

        <Section title="8. 문의처">
          <p>개인정보 관련 문의사항은 아래 이메일로 연락해 주시기 바랍니다.</p>
          <p style={{ marginTop: 8 }}>
            이메일:{" "}
            <a href="mailto:gwangma007@gmail.com" style={{ color: "var(--lavender-200)" }}>
              gwangma007@gmail.com
            </a>
          </p>
        </Section>

        <Section title="9. 개인정보 처리방침의 변경">
          <p>본 개인정보 처리방침은 법령 및 서비스 변경 사항을 반영하기 위해 개정될 수 있으며, 변경 시 이 페이지를 통해 고지합니다.</p>
        </Section>
      </div>
    </div>
  );
}
