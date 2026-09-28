"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ui.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

// 화면 아래에서 올라오는 시트. 앱 열 너비 안에서만 열린다.
export default function Sheet({ open, onClose, title, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.sheetLayer}>
      <button className={styles.scrim} aria-label="닫기" onClick={onClose} />
      <div ref={panelRef} className={styles.sheet} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <span className={styles.grabber} aria-hidden />
        {title && <h2 className={styles.sheetTitle}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
