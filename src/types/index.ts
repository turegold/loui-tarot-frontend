// API 명세.md 기준 타입 정의. 백엔드 연동 시에도 이 타입들을 그대로 사용한다.

export type ArcanaType = "MAJOR" | "MINOR";
export type Suit = "WAND" | "CUP" | "SWORD" | "PENTACLE";
export type Element = "FIRE" | "WATER" | "AIR" | "EARTH";
export type Topic = "COMPREHENSIVE" | "LOVE" | "CAREER" | "WEALTH";

export interface Card {
  id: number;
  nameKr: string;
  nameEn: string;
  arcanaType: ArcanaType;
  suit: Suit | null;
  element: Element | null;
  number: number | null;
  seoSlug: string;
  imageUrl?: string;
}

export interface CardDetail extends Card {
  uprightInterpretation: string;
  reversedInterpretation: string;
}

export interface User {
  id: number;
  nickname: string;
  profileImageUrl?: string;
}

export interface KakaoLoginResult {
  user: User;
  /** 최초 가입이면 true — 온보딩의 닉네임 설정 화면을 보여줄지 프론트가 이 값으로 판단 */
  isNewUser: boolean;
}

export interface FortuneCardSlot {
  /** 오늘의 스프레드 테마가 정한 자리 라벨 (예: "과거", "감정", "내면" 등 — 고정 enum 아님) */
  positionLabel: string;
  card: Card;
  isReversed: boolean;
  interpretation: string;
}

export interface FortuneResult {
  slug: string;
  nickname: string;
  topic: Topic;
  /** src/data/spreadThemes.ts의 SpreadTheme.key — 뽑은 시점의 테마를 고정 저장 */
  spreadThemeKey: string;
  cards: FortuneCardSlot[];
  /** 3장을 종합한 전체 흐름 해석. 경우의 수가 너무 많아 캐싱하지 않고 매 요청마다 생성 */
  overallInterpretation: string;
  createdAt: string;
}

export interface ChemiDraw {
  slug: string;
  nickname: string;
  card: Card;
  isReversed: boolean;
  interpretation: string;
  shareUrl: string;
  createdAt: string;
}

export interface ChemiResult {
  score: number;
  interpretation: string;
}

export interface ChemiGuestResponse {
  guestDraw: ChemiDraw;
  hostDraw: ChemiDraw;
  chemi: ChemiResult;
}

export interface ChemiRankingEntry {
  guestNickname: string;
  guestCard: Card;
  score: number;
}

export type ApiErrorCode =
  | "COMMON_INVALID_REQUEST"
  | "COMMON_NOT_FOUND"
  | "COMMON_INTERNAL_ERROR"
  | "AUTH_UNAUTHORIZED"
  | "AUTH_INVALID_TOKEN"
  | "AUTH_KAKAO_LOGIN_FAILED"
  | "CARD_NOT_FOUND"
  | "FORTUNE_NOT_FOUND"
  | "CHEMI_DRAW_NOT_FOUND"
  | "CHEMI_HOST_NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "AI_INTERPRETATION_FAILED";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: { field: string; message: string }[] | null;
}

export interface ApiMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta | null;
}
