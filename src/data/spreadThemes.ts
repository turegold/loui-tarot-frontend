export interface SpreadTheme {
  key: string;
  /** 3개 자리 라벨 (기존 과거/현재/미래처럼 슬롯 위에 뜨는 텍스트) */
  labels: [string, string, string];
  /** 결과 페이지 상단 뱃지 등에 쓰이는 짧은 부제 */
  subtitle: string;
}

/**
 * 개인 카드 뽑기 3장 스프레드의 자리 해석 기준.
 * 매번 "과거/현재/미래"만 반복되면 재미가 떨어져서, 날짜에 따라 자동으로 바뀐다 —
 * 같은 날에는 모두에게 같은 테마가 보이도록 결정론적으로 고른다(하루에 여러 번 뽑아도 라벨은 유지됨).
 * 뽑은 시점의 테마 key는 결과에 그대로 저장되므로(mockApi.ts), 이 배열 순서를 나중에 바꿔도
 * 이미 생성된 결과의 라벨은 바뀌지 않는다.
 */
export const SPREAD_THEMES: SpreadTheme[] = [
  { key: "time", labels: ["과거", "현재", "미래"], subtitle: "시간의 흐름" },
  { key: "emotion", labels: ["감정", "행동", "이해"], subtitle: "마음이 움직이는 방식" },
  { key: "self", labels: ["내면", "외면", "내면과 외면의 균형"], subtitle: "나와 세상 사이" },
  { key: "cause", labels: ["원인", "경과", "결과"], subtitle: "일이 흘러가는 이치" },
  { key: "growth", labels: ["두려움", "극복", "성장"], subtitle: "나를 넘어서는 과정" },
  { key: "scope", labels: ["나", "관계", "세상"], subtitle: "시야가 넓어지는 순서" },
  { key: "sort", labels: ["놓아야 할 것", "붙잡아야 할 것", "나아갈 방향"], subtitle: "지금 필요한 정리" },
  { key: "today", labels: ["오늘의 나", "오늘의 장애물", "오늘의 조언"], subtitle: "하루를 위한 조언" },
  { key: "seed", labels: ["씨앗", "뿌리", "열매"], subtitle: "성장의 단계" },
  { key: "dialogue", labels: ["질문", "응답", "깨달음"], subtitle: "마음속 대화" },
];

const DEFAULT_THEME = SPREAD_THEMES[0];

/** KST(UTC+9) 기준 1월 1일부터 며칠째인지 */
function dayOfYearKST(date: Date): number {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const startOfYear = Date.UTC(kst.getUTCFullYear(), 0, 1);
  const today = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  return Math.floor((today - startOfYear) / 86400000);
}

/** 오늘(KST 기준) 모두에게 동일하게 노출되는 스프레드 테마 */
export function getDailySpreadTheme(date: Date = new Date()): SpreadTheme {
  const idx = dayOfYearKST(date) % SPREAD_THEMES.length;
  return SPREAD_THEMES[idx];
}

export function getSpreadThemeByKey(key: string): SpreadTheme {
  return SPREAD_THEMES.find((t) => t.key === key) ?? DEFAULT_THEME;
}
