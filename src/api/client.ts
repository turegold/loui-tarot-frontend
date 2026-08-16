import type {
  ApiResponse,
  Card,
  CardDetail,
  ChemiDraw,
  ChemiGuestResponse,
  ChemiRankingEntry,
  FortuneResult,
  FortuneSummary,
  KakaoLoginResult,
  Topic,
  User,
} from "@/types";

/**
 * API 명세.md 엔드포인트와 1:1로 대응하는 실제 백엔드(Spring Boot, NEXT_PUBLIC_API_BASE_URL) 연동.
 * mockApi.ts가 잡아뒀던 함수 시그니처/응답 envelope을 그대로 유지해서, 페이지 쪽 코드는
 * import 경로만 바뀌면 되도록 했다.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

const KEYS = {
  user: "loui-tarot:user",
  accessToken: "loui-tarot:accessToken",
  refreshToken: "loui-tarot:refreshToken",
  ownedChemiSlugs: "loui-tarot:ownedChemiSlugs",
  /** hostSlug -> 이 브라우저가 그 host에게 이미 뽑아준 guestSlug. 같은 링크로 재방문 시 재사용. */
  guestDrawByHost: "loui-tarot:guestDrawByHost",
} as const;

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간 부족 등은 조용히 무시
  }
}

function removeStore(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

function networkFailure<T>(): ApiResponse<T> {
  return {
    success: false,
    data: null,
    error: { code: "COMMON_INTERNAL_ERROR", message: "서버에 연결할 수 없어요. 백엔드가 켜져 있는지 확인해주세요." },
    meta: null,
  };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    return networkFailure<T>();
  }

  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return networkFailure<T>();
  }
}

// ── 인증 (카카오 로그인) ─────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  return readStore<User | null>(KEYS.user, null);
}

function getAccessToken(): string | null {
  return readStore<string | null>(KEYS.accessToken, null);
}

function setSession(user: User, accessToken: string, refreshToken: string) {
  writeStore(KEYS.user, user);
  writeStore(KEYS.accessToken, accessToken);
  writeStore(KEYS.refreshToken, refreshToken);
}

/** 카카오 인가코드 → 백엔드 토큰 교환. 성공 시 세션(유저+토큰)을 저장한다. */
export async function exchangeKakaoCode(authorizationCode: string): Promise<ApiResponse<KakaoLoginResult>> {
  const res = await apiFetch<{ accessToken: string; refreshToken: string; user: User; isNewUser: boolean }>(
    "/auth/kakao/callback",
    { method: "POST", body: JSON.stringify({ authorizationCode }) }
  );
  if (!res.success || !res.data) {
    return { success: false, data: null, error: res.error, meta: null };
  }
  setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
  return { success: true, data: { user: res.data.user, isNewUser: res.data.isNewUser }, error: null, meta: null };
}

export async function updateMe(nickname: string): Promise<ApiResponse<User>> {
  const res = await apiFetch<User>("/users/me", { method: "PATCH", body: JSON.stringify({ nickname }) });
  if (res.success && res.data) writeStore(KEYS.user, res.data);
  return res;
}

/** 서버 로그아웃(리프레시 토큰 무효화)은 최선을 다해 시도하되, 실패해도 로컬 세션은 반드시 지운다. */
export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  } catch {
    // 네트워크 실패해도 로컬 로그아웃은 진행
  }
  removeStore(KEYS.user);
  removeStore(KEYS.accessToken);
  removeStore(KEYS.refreshToken);
}

// ── 카드 (GET /cards, GET /cards/{cardId}) ─────────────────────────────────

export function getCards(): Promise<ApiResponse<Card[]>> {
  return apiFetch<Card[]>("/cards");
}

export function getCard(cardId: number): Promise<ApiResponse<CardDetail>> {
  return apiFetch<CardDetail>(`/cards/${cardId}`);
}

// ── 케미 뽑기 (방장은 로그인, 게스트는 비로그인) ───────────────────────────────

function markOwned(slug: string) {
  const owned = readStore<string[]>(KEYS.ownedChemiSlugs, []);
  if (!owned.includes(slug)) writeStore(KEYS.ownedChemiSlugs, [...owned, slug]);
}

/** 이 브라우저가 만든(방장으로 뽑았거나, 게스트로 뽑아 자기 링크를 갖게 된) draw인지. */
export function isOwnedChemiSlug(slug: string): boolean {
  return readStore<string[]>(KEYS.ownedChemiSlugs, []).includes(slug);
}

/** 이 브라우저가 이 hostSlug에 이미 게스트로 참여했다면 그때 만든 guestSlug, 아니면 null. */
export function getMyGuestDrawSlug(hostSlug: string): string | null {
  const map = readStore<Record<string, string>>(KEYS.guestDrawByHost, {});
  return map[hostSlug] ?? null;
}

function rememberGuestDraw(hostSlug: string, guestSlug: string) {
  const map = readStore<Record<string, string>>(KEYS.guestDrawByHost, {});
  writeStore(KEYS.guestDrawByHost, { ...map, [hostSlug]: guestSlug });
}

export async function createChemiDraw(): Promise<ApiResponse<ChemiDraw>> {
  const res = await apiFetch<ChemiDraw>("/chemi-draws", { method: "POST" });
  if (res.success && res.data) markOwned(res.data.slug);
  return res;
}

export function getChemiDraw(slug: string): Promise<ApiResponse<ChemiDraw>> {
  return apiFetch<ChemiDraw>(`/chemi-draws/${slug}`);
}

export async function createChemiGuestDraw(hostSlug: string, nickname: string): Promise<ApiResponse<ChemiGuestResponse>> {
  const res = await apiFetch<ChemiGuestResponse>(`/chemi-draws/${hostSlug}/guests`, {
    method: "POST",
    body: JSON.stringify({ nickname }),
  });
  if (res.success && res.data) {
    // 게스트도 자기 draw의 "방장"이 될 수 있어야 확산 구조가 성립한다 (B가 C를 초대)
    markOwned(res.data.guestDraw.slug);
    // 같은 host 링크로 재방문했을 때 다시 뽑지 않고 이전 결과로 보내기 위해 기억해둔다.
    rememberGuestDraw(hostSlug, res.data.guestDraw.slug);
  }
  return res;
}

/**
 * 백엔드엔 host+guest를 한 번에 묶어 조회하는 엔드포인트가 따로 없다 — 게스트 자신의
 * GET /chemi-draws/{guestSlug} 응답에 이미 hostDraw/chemi가 함께 들어있어서 그걸 재조합한다.
 * hostSlug 파라미터는 라우트 형태를 유지하려고 남겨뒀을 뿐 실제 조회에는 쓰지 않는다.
 */
export async function getChemiVs(_hostSlug: string, guestSlug: string): Promise<ApiResponse<ChemiGuestResponse>> {
  const res = await apiFetch<ChemiDraw>(`/chemi-draws/${guestSlug}`);
  const guestDraw = res.data;
  if (!res.success || !guestDraw || !guestDraw.hostDraw || !guestDraw.chemi) {
    return {
      success: false,
      data: null,
      error: { code: "CHEMI_DRAW_NOT_FOUND", message: "존재하지 않는 케미 결과예요." },
      meta: null,
    };
  }
  return { success: true, data: { guestDraw, hostDraw: guestDraw.hostDraw, chemi: guestDraw.chemi }, error: null, meta: null };
}

export function getChemiRanking(hostSlug: string, page = 1, size = 20): Promise<ApiResponse<ChemiRankingEntry[]>> {
  return apiFetch<ChemiRankingEntry[]>(`/chemi-draws/${hostSlug}/ranking?page=${page}&size=${size}`);
}

// ── 개인 카드 뽑기 (카카오 로그인 필수) ──────────────────────────────────────

export function createFortune(topic: Topic): Promise<ApiResponse<FortuneResult>> {
  return apiFetch<FortuneResult>("/fortunes", { method: "POST", body: JSON.stringify({ topic }) });
}

export function getFortune(slug: string): Promise<ApiResponse<FortuneResult>> {
  return apiFetch<FortuneResult>(`/fortunes/${slug}`);
}

export function listMyFortunes(page = 1, size = 20): Promise<ApiResponse<FortuneSummary[]>> {
  return apiFetch<FortuneSummary[]>(`/users/me/fortunes?page=${page}&size=${size}`);
}
