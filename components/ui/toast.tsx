"use client";

import { useEffect, useState } from "react";
import styles from "./ui.module.css";

// 어디서든 toast("저장했어요")로 띄우는 짧은 알림
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("artmood:toast", { detail: message }));
}

export function Toaster() {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      setMsg({ text, id: Date.now() });
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 2400);
    };
    window.addEventListener("artmood:toast", on);
    return () => {
      window.removeEventListener("artmood:toast", on);
      clearTimeout(t);
    };
  }, []);
  return (
    <div className={styles.toastWrap} role="status" aria-live="polite">
      {msg && (
        <div key={msg.id} className={styles.toast}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
