"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Blobs, PrimaryButton, Starfield, TopBar, TopicCard } from "@/components/primitives";
import { LoadingState } from "@/components/LoadingState";
import { createFortune, getCurrentUser } from "@/api/mockApi";
import type { Topic } from "@/types";

const TOPICS: { key: Topic; icon: string; title: string; desc: string }[] = [
  { key: "COMPREHENSIVE", icon: "moon", title: "종합운", desc: "오늘의 전반적인 흐름" },
  { key: "LOVE", icon: "heart", title: "연애운", desc: "설렘과 관계의 흐름" },
  { key: "CAREER", icon: "briefcase", title: "취업운", desc: "새로운 기회의 흐름" },
  { key: "WEALTH", icon: "coin", title: "재물운", desc: "돈과 기회의 흐름" },
];

export default function FortuneTopicPage() {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getCurrentUser()) router.replace("/");
  }, [router]);

  async function handleDraw() {
    if (!topic) return;
    setLoading(true);
    const res = await createFortune(topic);
    if (res.success && res.data) {
      router.push(`/fortune/${res.data.slug}`);
      return;
    }
    setLoading(false);
  }

  if (loading) return <LoadingState />;

  return (
    <div className="screen">
      <Blobs />
      <Starfield />
      <TopBar backHref="/home" />
      <div className="screen-scroll" style={{ position: "relative", zIndex: 1, padding: "10px 24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontSize: 24 }}>
          어떤 운을
          <br />
          확인해볼까요?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {TOPICS.map((t) => (
            <TopicCard key={t.key} icon={t.icon} title={t.title} desc={t.desc} selected={topic === t.key} onClick={() => setTopic(t.key)} />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <PrimaryButton disabled={!topic} onClick={handleDraw}>
          카드 뽑으러 가기
        </PrimaryButton>
      </div>
    </div>
  );
}
