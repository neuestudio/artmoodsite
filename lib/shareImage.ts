import { WEEK_LABELS, fromKey, monthCells } from "./date";
import { colorById, type MoodColor } from "./palette";

// 인스타 스토리·피드에 올리기 좋은 4:5 공유 카드를 캔버스로 그린다
const W = 1080;
const H = 1350;
const PAPER = "#FBF8F2";
const INK = "#2C2926";
const SOFT = "#6F675E";

function fontVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function fonts() {
  return {
    en: fontVar("--font-en", "Georgia, serif"),
    ko: fontVar("--font-ko", "serif"),
    ui: '"Pretendard Variable", Pretendard, sans-serif',
  };
}

// 손으로 떨어뜨린 물감 방울처럼 살짝 찌그러진 원
function blob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, seed = 1) {
  const n = 9;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + Math.sin(seed * 12.9898 + i * 78.233) * 0.06;
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
  });
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % n];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    if (i === 0) ctx.moveTo(mx, my);
    else ctx.quadraticCurveTo(x0, y0, mx, my);
  }
  const [x0, y0] = pts[0];
  const [x1, y1] = pts[1];
  ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function base() {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  return { c, ctx };
}

function footer(ctx: CanvasRenderingContext2D, f: ReturnType<typeof fonts>) {
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.font = `italic 500 44px ${f.en}`;
  ctx.fillText("artmood", 90, H - 90);
  ctx.fillStyle = SOFT;
  ctx.textAlign = "right";
  ctx.font = `500 26px ${f.ui}`;
  ctx.fillText("색으로 기록하는 감정 다이어리", W - 90, H - 98);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  let line = "";
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lh;
      line = ch.trimStart();
    } else line += ch;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

function toBlob(c: HTMLCanvasElement) {
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("이미지 생성 실패"))), "image/png"));
}

export async function renderTestCard(color: MoodColor, title: string, ratios: { id: string; ratio: number }[]) {
  await document.fonts.ready;
  const f = fonts();
  const { c, ctx } = base();

  ctx.globalAlpha = 0.9;
  blob(ctx, W / 2, 470, 250, color.hex, 3);
  ctx.globalAlpha = 0.35;
  blob(ctx, W / 2 + 170, 330, 90, color.hex, 7);
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.fillStyle = SOFT;
  ctx.font = `600 30px ${f.ui}`;
  ctx.fillText("요즘 내 마음의 색", W / 2, 150);

  ctx.fillStyle = INK;
  ctx.font = `700 92px ${f.ko}`;
  ctx.fillText(color.ko, W / 2, 500);
  ctx.font = `italic 500 40px ${f.en}`;
  ctx.fillText(`${color.en} · ${color.colorName}`, W / 2, 565);

  ctx.font = `700 42px ${f.ko}`;
  wrap(ctx, title, W / 2, 850, 860, 60);

  // 비율 막대
  const top = ratios.slice(0, 4);
  const barX = 150;
  const barW = W - 300;
  let x = barX;
  const sum = top.reduce((s, r) => s + r.ratio, 0) || 1;
  for (const r of top) {
    const w = (r.ratio / sum) * barW;
    ctx.fillStyle = colorById(r.id)!.hex;
    ctx.fillRect(x, 1000, w - 4, 18);
    x += w;
  }
  ctx.font = `500 28px ${f.ui}`;
  ctx.fillStyle = SOFT;
  ctx.fillText(top.map((r) => `${colorById(r.id)!.ko} ${r.ratio}%`).join("   "), W / 2, 1075);

  footer(ctx, f);
  return toBlob(c);
}

export async function renderMonthCard(
  year: number,
  month: number,
  colors: Record<string, string | null>,
  ratios: { id: string; ratio: number }[],
) {
  await document.fonts.ready;
  const f = fonts();
  const { c, ctx } = base();

  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.font = `italic 500 110px ${f.en}`;
  ctx.fillText(new Date(year, month).toLocaleString("en", { month: "long" }), 90, 200);
  ctx.fillStyle = SOFT;
  ctx.font = `600 32px ${f.ui}`;
  ctx.fillText(`${year}년 ${month + 1}월의 무드`, 96, 260);

  const cells = monthCells(year, month);
  const gx = 90;
  const gy = 340;
  const cw = (W - 180) / 7;
  ctx.textAlign = "center";
  ctx.font = `600 24px ${f.ui}`;
  WEEK_LABELS.forEach((l, i) => {
    ctx.fillStyle = "#A79D91";
    ctx.fillText(l, gx + cw * i + cw / 2, gy);
  });
  cells.forEach((key, i) => {
    const cx = gx + (i % 7) * cw + cw / 2;
    const cy = gy + 70 + Math.floor(i / 7) * cw;
    if (!key) return;
    const col = colors[key];
    if (col) {
      ctx.globalAlpha = 0.9;
      blob(ctx, cx, cy, cw * 0.4, colorById(col)!.hex, i + 1);
      ctx.globalAlpha = 1;
    } else {
      ctx.strokeStyle = "#E3DBCF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, cw * 0.36, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = col ? "rgba(255,255,255,0.95)" : "#A79D91";
    ctx.font = `600 24px ${f.ui}`;
    ctx.fillText(String(fromKey(key).getDate()), cx, cy + 9);
  });

  const top = ratios.slice(0, 3);
  ctx.textAlign = "left";
  ctx.font = `600 30px ${f.ui}`;
  let y = H - 250;
  let x = 90;
  for (const r of top) {
    const col = colorById(r.id)!;
    blob(ctx, x + 16, y - 10, 16, col.hex, 2);
    ctx.fillStyle = INK;
    const label = `${col.ko} ${r.ratio}%`;
    ctx.fillText(label, x + 44, y);
    x += 44 + ctx.measureText(label).width + 40;
  }
  if (!top.length) {
    ctx.fillStyle = SOFT;
    ctx.fillText("아직 기록이 없어요", 90, y);
  }
  y += 10;

  footer(ctx, f);
  return toBlob(c);
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
