"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./app.module.css";

const TABS = [
  {
    href: "/app",
    label: "홈",
    icon: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1Z" />,
  },
  {
    href: "/app/calendar",
    label: "달력",
    icon: (
      <>
        <rect x="4" y="5.5" width="16" height="14.5" rx="3" />
        <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
      </>
    ),
  },
  null,
  {
    href: "/app/shop",
    label: "스토어",
    icon: <path d="M5.5 8.5h13l-1 11h-11Zm3.5 0V7a3 3 0 0 1 6 0v1.5" />,
  },
  {
    href: "/app/me",
    label: "나",
    icon: (
      <>
        <circle cx="12" cy="9" r="3.6" />
        <path d="M5 20c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5" />
      </>
    ),
  },
];

export default function TabBar({ onRecord }: { onRecord: () => void }) {
  const pathname = usePathname();
  return (
    <nav className={styles.tabbar} aria-label="주요 메뉴">
      {TABS.map((t) =>
        t ? (
          <Link
            key={t.href}
            href={t.href}
            className={styles.tab}
            aria-current={pathname === t.href ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              {t.icon}
            </svg>
            {t.label}
          </Link>
        ) : (
          <button key="record" className={styles.recordBtn} onClick={onRecord} aria-label="오늘 기록하기">
            <span>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </button>
        ),
      )}
    </nav>
  );
}
