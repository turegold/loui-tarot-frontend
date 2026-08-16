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

/**
 * 케미/개인 카드 뽑기 응답에 카드를 요약해서 실을 때 쓰는 최소 형태 — 백엔드의
 * CardBriefResponse(id, nameKr, imageUrl)와 1:1. GET /cards의 전체 Card와는 다른 타입이다.
 */
export interface CardBrief {
  id: number;
  nameKr: string;
  imageUrl: string;
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
  /** 그날의 스프레드 테마가 정한 자리 라벨(서버가 이미 완성된 문자열로 내려줌, 예: "과거", "감정") */
  positionLabel: string;
  card: CardBrief;
  isReversed: boolean;
  /** 목록(GET /users/me/fortunes)에서는 null — 상세(GET /fortunes/{slug})에서만 채워짐 */
  interpretation: string | null;
}

export interface FortuneResult {
  slug: string;
  /** POST 응답(방금 뽑은 본인)엔 없고, GET 응답(공유 링크로 조회)에만 채워짐 */
  nickname: string | null;
  topic: Topic;
  /** 백엔드 SpreadTheme.key — 뽑은 시점의 테마를 고정 저장 (참고/통계용, 라벨은 이미 cards[].positionLabel에 포함됨) */
  spreadThemeKey: string;
  cards: FortuneCardSlot[];
  /** 3장을 종합한 전체 흐름 해석. 경우의 수가 너무 많아 캐싱하지 않고 매 요청마다 생성 */
  overallInterpretation: string;
  createdAt: string;
}

/** GET /users/me/fortunes 목록 항목 — 해석 텍스트를 담지 않는 가벼운 형태(cards[].interpretation은 null). */
export interface FortuneSummary {
  slug: string;
  topic: Topic;
  cards: FortuneCardSlot[];
  createdAt: string;
}

export interface ChemiDraw {
  slug: string;
  nickname: string;
  card: CardBrief;
  isReversed: boolean;
  /** 다른 draw에 embed될 때(hostDraw 자리)는 null로 내려오기도 함 */
  interpretation: string | null;
  shareUrl: string;
  createdAt: string;
  /** 이 draw가 게스트로 참여한 적 있을 때만 채워짐(GET 조회 시). 방장 draw이거나 상대가 아직 없으면 null */
  hostDraw?: ChemiDraw | null;
  chemi?: ChemiResult | null;
}

export interface ChemiResult {
  score: number;
  interpretation: string;
}

/** GET /users/me/chemi-draws 목록 항목 — 로그인 방장으로 뽑은 케미 기록(해석 텍스트 없음). */
export interface ChemiSummary {
  slug: string;
  card: CardBrief;
  isReversed: boolean;
  createdAt: string;
}

export interface ChemiGuestResponse {
  guestDraw: ChemiDraw;
  hostDraw: ChemiDraw;
  chemi: ChemiResult;
}

export interface ChemiRankingEntry {
  guestNickname: string;
  guestCard: CardBrief;
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
