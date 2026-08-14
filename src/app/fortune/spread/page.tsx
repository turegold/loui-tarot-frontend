"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { Blobs, Icon, Starfield, TopBar, Twinkles } from "@/components/primitives";
import { LoadingState } from "@/components/LoadingState";
import { createFortune, getCurrentUser } from "@/api/mockApi";
import { getDailySpreadTheme } from "@/data/spreadThemes";
import type { Topic } from "@/types";

const SPREAD_SIZE = 24;
const PENDING_TOPIC_KEY = "loui-tarot:pendingTopic";
const SCROLL_STEP = 260;
const DRAG_THRESHOLD = 4;

function isTopic(v: string | null): v is Topic {
  return v === "COMPREHENSIVE" || v === "LOVE" || v === "CAREER" || v === "WEALTH";
}

/** ⑪ 스프레드 뽑기 — 78장 미니 카드를 가로로 훑으며 탭하면 뒤집히고, 오늘의 테마 자리를 순서대로 채운다 */
export default function FortuneSpreadPage() {
  const router = useRouter();
  const theme = useMemo(() => getDailySpreadTheme(), []);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [flippingIdx, setFlippingIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startScroll: 0, moved: false });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (!getCurrentUser()) {
      router.replace("/");
      return;
    }
    const pending = typeof window !== "undefined" ? window.sessionStorage.getItem(PENDING_TOPIC_KEY) : null;
    if (!isTopic(pending)) {
      router.replace("/fortune/topic");
      return;
    }
    setTopic(pending);
  }, [router]);

  const usedSet = useMemo(() => new Set(drawn), [drawn]);

  function pick(idx: number) {
    if (dragRef.current.moved) return; // 드래그 끝에 발생하는 클릭은 카드 선택으로 처리하지 않음
    if (drawn.length >= 3 || usedSet.has(idx) || flippingIdx !== null) return;
    setFlippingIdx(idx);
    setTimeout(() => {
      setDrawn((prev) => [...prev, idx]);
      setFlippingIdx(null);
    }, 520);
  }

  useEffect(() => {
    if (drawn.length !== 3 || !topic) return;
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await createFortune(topic);
      if (res.success && res.data) {
        window.sessionStorage.removeItem(PENDING_TOPIC_KEY);
        router.push(`/fortune/${res.data.slug}`);
        return;
      }
      setError(res.error?.message ?? "뽑기에 실패했어요.");
      setLoading(false);
      setDrawn([]);
    }, 500);
    return () => clearTimeout(t);
  }, [drawn.length, topic, router]);

  function updateScrollState() {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
  }

  // 트랙이 처음 렌더된 뒤(topic 확인 전엔 로딩 화면이라 ref가 비어있음) 화살표 활성 상태를 한 번 계산
  useEffect(() => {
    if (!topic) return;
    const id = requestAnimationFrame(updateScrollState);
    return () => cancelAnimationFrame(id);
  }, [topic]);

  // 터치는 브라우저 기본 스와이프 스크롤을 그대로 쓰고, 마우스 드래그만 직접 구현한다
  // (스와이프처럼 드래그해서 넘기고 싶다는 요청 — 터치는 이미 되지만 데스크톱 마우스는 안 됐음)
  // window에 리스너를 직접 붙였다 떼는 방식을 쓴다 — setPointerCapture를 컨테이너에 걸면
  // 브라우저가 click 이벤트까지 그 컨테이너로 재타겟팅해버려서, 드래그 없이 탭만 해도
  // 개별 미니 카드의 onClick(pick)이 아예 발생하지 않는 문제가 있었다.
  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { dragging: true, startX: e.clientX, startScroll: track.scrollLeft, moved: false };

    function onMove(ev: PointerEvent) {
      const st = dragRef.current;
      if (!st.dragging) return;
      const dx = ev.clientX - st.startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) st.moved = true;
      track!.scrollLeft = st.startScroll - dx;
      updateScrollState();
    }
    function onUp() {
      dragRef.current.dragging = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      // click 이벤트가 이 직후에 발생하므로, moved 플래그는 다음 tick에 초기화한다
      setTimeout(() => {
        dragRef.current.moved = false;
      }, 0);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function scrollByStep(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  }

  if (!topic || loading) return <LoadingState />;

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar onBack={() => router.push("/fortune/topic")} />
      <div style={{ position: "relative", zIndex: 1, padding: "0 20px 8px" }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>
          {theme.labels.join(" · ")}
          <br />
          3장을 뽑아보세요
        </h2>
      </div>
      <div className="spread-slot-row" style={{ position: "relative", zIndex: 1, marginBottom: 18 }}>
        {theme.labels.map((label, i) => {
          const filled = i < drawn.length;
          return (
            <div key={label} className={"spread-slot" + (filled ? " filled" : "")}>
              {filled ? (
                <>
                  <Icon name="check" size={16} color="var(--lavender-300)" />
                  <span style={{ color: "var(--lavender-100)" }}>{label}</span>
                </>
              ) : (
                <span>{label}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1 }}>
        <div className="spread-nav">
          <button className="spread-nav-btn prev" disabled={!canScrollLeft} onClick={() => scrollByStep(-1)} aria-label="이전 카드 보기">
            <Icon name="chevronLeft" size={18} />
          </button>
          <button className="spread-nav-btn next" disabled={!canScrollRight} onClick={() => scrollByStep(1)} aria-label="다음 카드 보기">
            <Icon name="chevronRight" size={18} />
          </button>
          <div ref={trackRef} className="spread-track" onPointerDown={handlePointerDown} onScroll={updateScrollState}>
            {Array.from({ length: SPREAD_SIZE }).map((_, i) => (
              <div
                key={i}
                className={"mini-flip" + (flippingIdx === i || usedSet.has(i) ? " flipped" : "") + (usedSet.has(i) ? " used" : "")}
                onClick={() => pick(i)}
              >
                <div className="mini-flip-inner">
                  <div className="mini-face back">
                    <Twinkles n={2} />
                  </div>
                  <div className="mini-face front">
                    <Icon name="sparkle" size={16} color="var(--lavender-300)" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-caption)", padding: "4px 20px 20px" }}>
          스프레드를 드래그하거나 화살표로 넘기며 마음에 드는 카드를 골라보세요 ({drawn.length}/3)
        </p>
        {error && <p style={{ textAlign: "center", color: "var(--pink-accent)", fontSize: "var(--text-caption)" }}>{error}</p>}
      </div>
    </div>
  );
}
