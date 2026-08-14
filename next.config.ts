import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 같은 와이파이의 휴대폰 등에서 로컬 IP로 접속해 모바일 테스트할 때 필요.
  // IP는 공유기 DHCP로 재할당되면 바뀔 수 있으니, 접속이 막히면 여기 값을 현재 IP로 갱신할 것.
  allowedDevOrigins: ["192.168.0.12"],
};

export default nextConfig;
