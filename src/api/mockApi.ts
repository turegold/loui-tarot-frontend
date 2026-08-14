import { CARDS, getCardById, randomCard } from "@/data/cards";
import { calculateChemiScore, chemiTier } from "@/utils/chemiScore";
import type {
  ApiResponse,
  Card,
  CardDetail,
  ChemiDraw,
  ChemiGuestResponse,
  ChemiRankingEntry,
  ChemiResult,
  FortuneResult,
  Topic,
  User,
} from "@/types";

/**
 * 백엔드(Spring Boot)가 아직 없어서, API 명세.md의 엔드포인트와 1:1로 대응하는 함수들을
 * localStorage 기반으로 흉내낸다. 나중에 실제 API를 붙일 때는 이 파일의 구현부만
 * `fetch(BASE_URL + ...)`로 교체하면 되도록 함수 시그니처와 응답 envelope을 그대로 맞췄다.
 *
 * AI 해석 "텍스트"는 전부 임시 템플릿이다 (실제 AI 연동은 후속 작업).
 * 케미 "점수"는 목업이 아니라 케미 점수 산출 로직.md의 실제 규칙을 계산한다.
 */

const KEYS = {
  user: "loui-tarot:user",
  chemiDraws: "loui-tarot:chemiDraws",
  chemis: "loui-tarot:chemis",
  ownedChemiSlugs: "loui-tarot:ownedChemiSlugs",
  fortunes: "loui-tarot:fortunes",
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
    // 저장 공간 부족 등은 목업 단계에서 무시
  }
}

function generateSlug(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function ok<T>(data: T, meta?: ApiResponse<T>["meta"]): ApiResponse<T> {
  return { success: true, data, error: null, meta: meta ?? null };
}

function fail<T>(code: NonNullable<ApiResponse<T>["error"]>["code"], message: string): ApiResponse<T> {
  return { success: false, data: null, error: { code, message, details: null }, meta: null };
}

/** 실제 fetch 지연을 흉내내는 짧은 딜레이 (LoadingState와 함께 사용) */
function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TOPIC_LABEL: Record<Topic, string> = {
  COMPREHENSIVE: "종합운",
  LOVE: "연애운",
  CAREER: "취업운",
  WEALTH: "재물운",
};

export function mockGeneralInterpretation(card: Card, reversed: boolean): string {
  const dir = reversed ? "역방향" : "정방향";
  const scope = card.arcanaType === "MAJOR" ? "인생의 큰 흐름" : "일상 속 구체적인 상황";
  return `${card.nameKr}(${dir}) 카드는 지금 ${scope}을 상징해요. (AI 해석 연동 전 임시 텍스트)`;
}

function mockTopicInterpretation(card: Card, reversed: boolean, topic: Topic): string {
  const dir = reversed ? "역방향" : "정방향";
  return `${TOPIC_LABEL[topic]} 기준으로 ${card.nameKr}(${dir}) 카드가 나왔어요. 지금은 그 흐름에 집중해볼 때예요. (AI 해석 연동 전 임시 텍스트)`;
}

function mockChemiInterpretation(cardA: Card, cardB: Card, score: number): string {
  const tier = chemiTier(score);
  return `${cardA.nameKr}와(과) ${cardB.nameKr}의 조합은 "${tier}" 궁합이에요. 서로의 속도를 존중하면 더 좋아질 관계예요. (AI 해석 연동 전 임시 텍스트)`;
}

// ── 인증 (Kakao 로그인은 실제 OAuth 미연동, mock으로 세션만 흉내) ───────────

export function getCurrentUser(): User | null {
  return readStore<User | null>(KEYS.user, null);
}

export async function kakaoLoginMock(nickname = "타로러"): Promise<ApiResponse<User>> {
  await delay(400);
  const user: User = { id: 1, nickname };
  writeStore(KEYS.user, user);
  return ok(user);
}

export function logoutMock() {
  writeStore(KEYS.user, null);
}

// ── 카드 (GET /cards, GET /cards/{cardId}) ─────────────────────────────────

export async function getCards(): Promise<ApiResponse<Card[]>> {
  await delay(150);
  return ok(CARDS);
}

export async function getCard(cardId: number): Promise<ApiResponse<CardDetail>> {
  await delay(150);
  const card = getCardById(cardId);
  if (!card) return fail("CARD_NOT_FOUND", "존재하지 않는 카드입니다.");
  return ok({
    ...card,
    uprightInterpretation: mockGeneralInterpretation(card, false),
    reversedInterpretation: mockGeneralInterpretation(card, true),
  });
}

// ── 케미 뽑기 (비로그인) ────────────────────────────────────────────────────

interface StoredChemiDraw {
  slug: string;
  nickname: string;
  cardId: number;
  isReversed: boolean;
  createdAt: string;
}

interface StoredChemi {
  hostSlug: string;
  guestSlug: string;
  score: number;
  createdAt: string;
}

function toChemiDraw(stored: StoredChemiDraw): ChemiDraw | null {
  const card = getCardById(stored.cardId);
  if (!card) return null;
  return {
    slug: stored.slug,
    nickname: stored.nickname,
    card,
    isReversed: stored.isReversed,
    interpretation: mockGeneralInterpretation(card, stored.isReversed),
    shareUrl: typeof window !== "undefined" ? `${window.location.origin}/chemi/${stored.slug}` : `/chemi/${stored.slug}`,
    createdAt: stored.createdAt,
  };
}

export async function createChemiDraw(nickname: string): Promise<ApiResponse<ChemiDraw>> {
  await delay(600);
  const { card, isReversed } = randomCard();
  const stored: StoredChemiDraw = { slug: generateSlug(), nickname, cardId: card.id, isReversed, createdAt: new Date().toISOString() };

  const all = readStore<Record<string, StoredChemiDraw>>(KEYS.chemiDraws, {});
  all[stored.slug] = stored;
  writeStore(KEYS.chemiDraws, all);

  const owned = readStore<string[]>(KEYS.ownedChemiSlugs, []);
  writeStore(KEYS.ownedChemiSlugs, [...owned, stored.slug]);

  return ok(toChemiDraw(stored)!);
}

export async function getChemiDraw(slug: string): Promise<ApiResponse<ChemiDraw>> {
  await delay(200);
  const all = readStore<Record<string, StoredChemiDraw>>(KEYS.chemiDraws, {});
  const stored = all[slug];
  if (!stored) return fail("CHEMI_DRAW_NOT_FOUND", "존재하지 않는 케미 뽑기 결과입니다.");
  return ok(toChemiDraw(stored)!);
}

/** 이 브라우저에서 만든(=방장인) draw인지 — 서버에 로그인이 없어 localStorage로 소유 여부를 판단 */
export function isOwnedChemiSlug(slug: string): boolean {
  return readStore<string[]>(KEYS.ownedChemiSlugs, []).includes(slug);
}

function buildChemiGuestResponse(host: StoredChemiDraw, guest: StoredChemiDraw, score: number): ChemiGuestResponse {
  const hostCard = getCardById(host.cardId)!;
  const guestCard = getCardById(guest.cardId)!;
  const chemi: ChemiResult = { score, interpretation: mockChemiInterpretation(hostCard, guestCard, score) };
  return { guestDraw: toChemiDraw(guest)!, hostDraw: toChemiDraw(host)!, chemi };
}

export async function createChemiGuestDraw(hostSlug: string, nickname: string): Promise<ApiResponse<ChemiGuestResponse>> {
  await delay(600);
  const draws = readStore<Record<string, StoredChemiDraw>>(KEYS.chemiDraws, {});
  const host = draws[hostSlug];
  if (!host) return fail("CHEMI_HOST_NOT_FOUND", "존재하지 않는 방장 링크입니다.");

  const { card, isReversed } = randomCard();
  const guest: StoredChemiDraw = { slug: generateSlug(), nickname, cardId: card.id, isReversed, createdAt: new Date().toISOString() };
  draws[guest.slug] = guest;
  writeStore(KEYS.chemiDraws, draws);

  // 게스트도 자기 draw의 "방장"이 될 수 있어야 확산 구조가 성립한다 (B가 C를 초대) — 이 브라우저에 소유 등록
  const owned = readStore<string[]>(KEYS.ownedChemiSlugs, []);
  writeStore(KEYS.ownedChemiSlugs, [...owned, guest.slug]);

  const hostCard = getCardById(host.cardId)!;
  const score = calculateChemiScore({ cardA: hostCard, isReversedA: host.isReversed, cardB: card, isReversedB: isReversed });

  const chemis = readStore<StoredChemi[]>(KEYS.chemis, []);
  chemis.push({ hostSlug, guestSlug: guest.slug, score, createdAt: guest.createdAt });
  writeStore(KEYS.chemis, chemis);

  return ok(buildChemiGuestResponse(host, guest, score));
}

export async function getChemiVs(hostSlug: string, guestSlug: string): Promise<ApiResponse<ChemiGuestResponse>> {
  await delay(200);
  const draws = readStore<Record<string, StoredChemiDraw>>(KEYS.chemiDraws, {});
  const host = draws[hostSlug];
  const guest = draws[guestSlug];
  if (!host || !guest) return fail("CHEMI_DRAW_NOT_FOUND", "존재하지 않는 케미 결과입니다.");

  const chemis = readStore<StoredChemi[]>(KEYS.chemis, []);
  const record = chemis.find((c) => c.hostSlug === hostSlug && c.guestSlug === guestSlug);
  const hostCard = getCardById(host.cardId)!;
  const guestCard = getCardById(guest.cardId)!;
  const score =
    record?.score ??
    calculateChemiScore({ cardA: hostCard, isReversedA: host.isReversed, cardB: guestCard, isReversedB: guest.isReversed });

  return ok(buildChemiGuestResponse(host, guest, score));
}

export async function getChemiRanking(hostSlug: string, page = 1, size = 20): Promise<ApiResponse<ChemiRankingEntry[]>> {
  await delay(200);
  const draws = readStore<Record<string, StoredChemiDraw>>(KEYS.chemiDraws, {});
  const chemis = readStore<StoredChemi[]>(KEYS.chemis, []);

  const entries: ChemiRankingEntry[] = chemis
    .filter((c) => c.hostSlug === hostSlug)
    .map((c) => {
      const guest = draws[c.guestSlug];
      const guestCard = guest ? getCardById(guest.cardId) : undefined;
      return guest && guestCard ? { guestNickname: guest.nickname, guestCard, score: c.score } : null;
    })
    .filter((e): e is ChemiRankingEntry => e !== null)
    .sort((a, b) => b.score - a.score);

  const start = (page - 1) * size;
  const paged = entries.slice(start, start + size);
  return ok(paged, { page, size, totalElements: entries.length, totalPages: Math.max(1, Math.ceil(entries.length / size)) });
}

// ── 개인 카드 뽑기 (카카오 로그인 필수) ──────────────────────────────────────

interface StoredFortune {
  slug: string;
  userId: number;
  cardId: number;
  isReversed: boolean;
  topic: Topic;
  createdAt: string;
}

function toFortuneResult(stored: StoredFortune, nickname: string): FortuneResult | null {
  const card = getCardById(stored.cardId);
  if (!card) return null;
  return {
    slug: stored.slug,
    nickname,
    card,
    isReversed: stored.isReversed,
    topic: stored.topic,
    interpretation: mockTopicInterpretation(card, stored.isReversed, stored.topic),
    createdAt: stored.createdAt,
  };
}

export async function createFortune(topic: Topic): Promise<ApiResponse<FortuneResult>> {
  const user = getCurrentUser();
  if (!user) return fail("AUTH_UNAUTHORIZED", "로그인이 필요합니다.");
  await delay(700);

  const { card, isReversed } = randomCard();
  const stored: StoredFortune = { slug: generateSlug(), userId: user.id, cardId: card.id, isReversed, topic, createdAt: new Date().toISOString() };

  const all = readStore<Record<string, StoredFortune>>(KEYS.fortunes, {});
  all[stored.slug] = stored;
  writeStore(KEYS.fortunes, all);

  return ok(toFortuneResult(stored, user.nickname)!);
}

export async function getFortune(slug: string): Promise<ApiResponse<FortuneResult>> {
  await delay(200);
  const all = readStore<Record<string, StoredFortune>>(KEYS.fortunes, {});
  const stored = all[slug];
  if (!stored) return fail("FORTUNE_NOT_FOUND", "존재하지 않는 결과입니다.");
  const user = getCurrentUser();
  return ok(toFortuneResult(stored, user?.nickname ?? "게스트")!);
}

export async function listMyFortunes(page = 1, size = 20): Promise<ApiResponse<FortuneResult[]>> {
  const user = getCurrentUser();
  if (!user) return fail("AUTH_UNAUTHORIZED", "로그인이 필요합니다.");
  await delay(200);

  const all = readStore<Record<string, StoredFortune>>(KEYS.fortunes, {});
  const mine = Object.values(all)
    .filter((f) => f.userId === user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((f) => toFortuneResult(f, user.nickname))
    .filter((f): f is FortuneResult => f !== null);

  const start = (page - 1) * size;
  const paged = mine.slice(start, start + size);
  return ok(paged, { page, size, totalElements: mine.length, totalPages: Math.max(1, Math.ceil(mine.length / size)) });
}
