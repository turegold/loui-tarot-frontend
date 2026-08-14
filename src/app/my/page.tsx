"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs, GhostButton, Icon, Starfield, TopBar } from "@/components/primitives";
import { getCurrentUser, listMyFortunes, logoutMock, updateMe } from "@/api/mockApi";
import type { FortuneResult, Topic, User } from "@/types";

const TOPIC_LABEL: Record<Topic, string> = {
  COMPREHENSIVE: "종합운",
  LOVE: "연애운",
  CAREER: "취업운",
  WEALTH: "재물운",
};

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<FortuneResult[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace("/");
      return;
    }
    setUser(u);
    setDraft(u.nickname);
    listMyFortunes().then((res) => {
      if (res.success && res.data) setRows(res.data);
    });
  }, [router]);

  async function handleSaveNickname() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSaving(true);
    const res = await updateMe(trimmed);
    if (res.success && res.data) setUser(res.data);
    setSaving(false);
    setEditing(false);
  }

  if (!user) return null;

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar title="마이페이지" backHref="/home" />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "8px 20px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="card-glass" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <div className="avatar-circle">{user.nickname.slice(0, 1)}</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {editing ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input-field"
                  style={{ minHeight: 44, flex: 1 }}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={30}
                />
                <button className="btn-primary" style={{ width: 60, minHeight: 44 }} disabled={saving || !draft.trim()} onClick={handleSaveNickname}>
                  저장
                </button>
              </div>
            ) : (
              <>
                <span style={{ fontSize: "var(--text-subtitle)", fontFamily: "var(--font-display)" }}>{user.nickname}</span>
                <button
                  className="btn-text"
                  style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4 }}
                  onClick={() => {
                    setDraft(user.nickname);
                    setEditing(true);
                  }}
                >
                  <Icon name="edit" size={13} />
                  닉네임 수정
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>내 기록</span>
          {rows?.length === 0 && (
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", textAlign: "center", marginTop: 20 }}>
              아직 뽑은 카드가 없어요.
            </p>
          )}
          {rows?.map((r) => (
            <Link key={r.slug} href={`/fortune/${r.slug}`} className="progress-list-row" style={{ textDecoration: "none", color: "inherit" }}>
              <div
                style={{
                  width: 40,
                  height: 56,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,var(--lavender-300),var(--pink-accent))",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: "var(--text-body)" }}>{r.cards.map((c) => c.card.nameKr).join(" · ")}</span>
                <span style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>
                  {new Date(r.createdAt).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} · {TOPIC_LABEL[r.topic]}
                </span>
              </div>
              <Icon name="chevronRight" size={18} color="var(--text-muted)" />
            </Link>
          ))}
        </div>

        <GhostButton
          onClick={() => {
            logoutMock();
            router.push("/");
          }}
        >
          로그아웃
        </GhostButton>
      </div>
    </div>
  );
}
