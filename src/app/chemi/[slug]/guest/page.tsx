import { ChemiGuestClient } from "./ChemiGuestClient";

/**
 * 정적 export(S3+CloudFront)는 동적 세그먼트마다 generateStaticParams가 있어야 하는데,
 * slug는 런타임에 생성돼 빌드 타임엔 알 수 없다 — "_shell"이라는 고정 slug 하나만 미리 만들어
 * out/chemi/_shell/guest/index.html로 내보내고, 실제 slug별 데이터는 클라이언트 컴포넌트가
 * API로 직접 채운다. CloudFront Function이 /chemi/{실제 slug}/guest를 이 파일로 리라이트해준다는
 * 전제(인프라 아키텍처.md). export는 빈 배열을 허용하지 않아 최소 1개는 있어야 한다.
 */
export function generateStaticParams() {
  return [{ slug: "_shell" }];
}

export default function ChemiGuestPage() {
  return <ChemiGuestClient />;
}
