"use client";

import { useEffect, useState } from "react";

/**
 * 정적 export(output: export)에서 slug 동적 라우트는 빌드 타임에 "_shell" placeholder
 * 하나만 프리렌더되고, 실제 slug별 URL(/fortune/abc123 등)은 CloudFront Function이
 * viewer-request 단계에서 이 shell 파일로 리라이트해서 서빙한다(S3/CloudFront 상에서만
 * 벌어지는 일이라 브라우저 주소창은 그대로 실제 slug를 보여준다).
 *
 * 그 결과 useParams()는 이 페이지가 빌드될 때의 고정 파라미터("_shell")를 그대로 돌려줘서
 * 실제 요청 slug와 다르다 — 항상 window.location.pathname에서 직접 읽어야 한다.
 */
export function useUrlSlug(segmentIndex: number): string | null {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const segment = window.location.pathname.split("/")[segmentIndex];
    setSlug(segment ? decodeURIComponent(segment) : null);
  }, [segmentIndex]);

  return slug;
}
