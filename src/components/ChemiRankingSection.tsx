import { Icon } from "@/components/primitives";
import { ConstellationMap } from "@/components/ConstellationMap";
import type { ChemiRankingEntry } from "@/types";

/** 케미 순위(리스트 + 별자리 지도) — 탭으로 나누지 않고 결과 화면에 이어서 보여준다. */
export function ChemiRankingSection({ rows }: { rows: ChemiRankingEntry[] | null }) {
  const count = rows?.length ?? 0;
  return (
    <div className="card-glass" style={{ width: "100%", padding: 20, marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-subtitle)" }}>케미 순위 · {count}명</span>
        <span className="badge-pill">
          <Icon name="list" size={13} />
          방문자
        </span>
      </div>

      {count === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-caption)", textAlign: "center", padding: "12px 0" }}>
          아직 아무도 없어요 — 링크를 공유하면 친구들이 여기 올라와요.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows!.map((r, i) => (
            <div key={i} className="progress-list-row">
              <span style={{ width: 22, textAlign: "center", color: "var(--lavender-300)", fontFamily: "var(--font-display)" }}>{i + 1}</span>
              <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: "var(--text-caption)", flexShrink: 0 }}>
                {r.guestNickname.slice(0, 1)}
              </div>
              <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: "var(--text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.guestNickname}
                </span>
                <span
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.guestCard.nameKr} 카드
                </span>
              </div>
              <img
                src={r.guestCard.imageUrl}
                alt={r.guestCard.nameKr}
                style={{ width: 30, height: 52, objectFit: "contain", borderRadius: 6, background: "var(--bg-card-strong)", flexShrink: 0 }}
              />
              <span className="badge-pill" style={{ flexShrink: 0 }}>
                {r.score}점
              </span>
            </div>
          ))}
        </div>
      )}

      <ConstellationMap entries={rows ?? []} />
    </div>
  );
}
