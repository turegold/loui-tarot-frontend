"use client";

import { useState } from "react";
import { Icon } from "@/components/primitives";

export function CopyShareButton({ url, label = "케미 보기 링크 공유" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn-primary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // 클립보드 권한이 없는 환경은 조용히 무시 (임시 처리)
        }
      }}
    >
      <Icon name="share" size={18} color="#fff" />
      {copied ? "링크 복사됨!" : label}
    </button>
  );
}
