import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이전 버전 주소 호환: 다이어리 → 앱 오늘의 페이지, 지난 페이지 → 달력
  async redirects() {
    return [
      { source: "/archive", destination: "/app/calendar", permanent: false },
    ];
  },
};

export default nextConfig;
