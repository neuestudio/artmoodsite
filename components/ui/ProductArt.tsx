import { PALETTE } from "@/lib/palette";

// 상품 사진 대신 쓰는 일러스트. kind: book-bookmark(A 구성) | book-pencils(B 구성)
export default function ProductArt({ kind }: { kind: "book-bookmark" | "book-pencils" }) {
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={kind === "book-pencils" ? "컬러링북과 8색 색연필" : "컬러링북과 책갈피"}>
      <defs>
        <filter id="pa-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <clipPath id="pa-cover">
          <rect x="0" y="0" width="150" height="200" rx="6" />
        </clipPath>
      </defs>

      {/* 그림자 */}
      <ellipse cx="200" cy="262" rx="150" ry="14" fill="#3b2e22" opacity="0.08" />

      {/* 컬러링북 */}
      <g transform={kind === "book-pencils" ? "translate(70 42) rotate(-6)" : "translate(96 40) rotate(-4)"}>
        <rect x="6" y="6" width="150" height="200" rx="6" fill="#d9cfbf" />
        <rect x="0" y="0" width="150" height="200" rx="6" fill="#fbf8f2" stroke="#e3dbcf" />
        <g clipPath="url(#pa-cover)">
          <circle cx="62" cy="96" r="34" fill="#9DBF9E" opacity="0.8" filter="url(#pa-blur)" />
          <circle cx="92" cy="120" r="28" fill="#F2C14E" opacity="0.8" filter="url(#pa-blur)" />
          <circle cx="70" cy="136" r="22" fill="#EE8A6F" opacity="0.75" filter="url(#pa-blur)" />
          <image href="/drawings/d1.png" x="30" y="40" width="90" height="128" />
        </g>
        <rect x="0" y="0" width="10" height="200" rx="3" fill="#2c2926" opacity="0.08" />
        <text x="75" y="186" textAnchor="middle" fontFamily="var(--font-en), serif" fontStyle="italic" fontSize="17" fill="#2c2926">
          artmood
        </text>
        <text x="75" y="26" textAnchor="middle" fontFamily="var(--font-ui)" fontSize="7.5" letterSpacing="2" fill="#6f675e">
          MOOD COLORING BOOK
        </text>
      </g>

      {kind === "book-pencils" ? (
        // 8색 색연필 (부채꼴)
        <g transform="translate(288 250)">
          {PALETTE.map((c, i) => {
            const a = -18 + i * 6.8;
            return (
              <g key={c.id} transform={`rotate(${a})`}>
                <rect x="-5" y="-176" width="10" height="150" rx="1.5" fill={c.hex} />
                <rect x="-5" y="-176" width="3" height="150" fill="#fff" opacity="0.22" />
                <path d="M-5 -176 L0 -196 L5 -176 Z" fill="#ead9bf" />
                <path d="M-1.8 -189 L0 -196 L1.8 -189 Z" fill={c.hex} />
                <rect x="-5" y="-40" width="10" height="14" fill="#2c2926" opacity="0.12" />
              </g>
            );
          })}
        </g>
      ) : (
        // 색칠할 수 있는 책갈피 두 장
        <g>
          <g transform="translate(262 58) rotate(8)">
            <rect x="0" y="0" width="44" height="160" rx="5" fill="#fbf8f2" stroke="#e3dbcf" />
            <circle cx="22" cy="60" r="16" fill="#D98BA0" opacity="0.7" filter="url(#pa-blur)" />
            <circle cx="20" cy="96" r="14" fill="#9A8FB5" opacity="0.7" filter="url(#pa-blur)" />
            <image href="/drawings/d4.png" x="4" y="36" width="36" height="84" />
            <circle cx="22" cy="14" r="4" fill="none" stroke="#b9ae9f" strokeWidth="1.5" />
            <path d="M22 18 C 30 -6, 40 -14, 46 -24" stroke="#C4553B" strokeWidth="2" fill="none" />
          </g>
          <g transform="translate(300 76) rotate(16)">
            <rect x="0" y="0" width="44" height="160" rx="5" fill="#fbf8f2" stroke="#e3dbcf" />
            <image href="/drawings/d6.png" x="4" y="36" width="36" height="84" />
            <circle cx="22" cy="14" r="4" fill="none" stroke="#b9ae9f" strokeWidth="1.5" />
            <path d="M22 18 C 28 -4, 36 -10, 42 -22" stroke="#4A6FA5" strokeWidth="2" fill="none" />
          </g>
        </g>
      )}
    </svg>
  );
}
