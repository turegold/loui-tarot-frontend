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

export interface FortuneResult {
  slug: string;
  nickname: string;
  card: Card;
  isReversed: boolean;
  topic: Topic;
  interpretation: string;
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
