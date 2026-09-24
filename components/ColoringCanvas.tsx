"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { ART_H, ART_W, drawingSrc } from "@/lib/drawings";
import { dilate, floodRegion, lineMaskFromImage } from "@/lib/fill";
import { PALETTE, hexToRgb } from "@/lib/palette";
import styles from "./ColoringCanvas.module.css";

export type Tool = "brush" | "fill" | "eraser";

export type ColoringHandle = {
  undo: () => void;
  clear: () => void;
  canUndo: () => boolean;
  exportPaint: () => Promise<Blob | null>;
  dominantColor: () => string | null;
};

type Props = {
  drawingId: number;
  color: string;
  tool: Tool;
  size: number;
  initialPaint: Blob | null;
  onChange: () => void;
  onNotice?: (msg: string) => void;
  ref?: Ref<ColoringHandle>;
};

// 물감을 한 겹씩 얹는 느낌: 획 하나는 균일하게, 겹칠수록 색이 섞이며 깊어진다
const GLAZE = 0.78;
const WALL_RADIUS = 5;
const MAX_UNDO = 15;

export default function ColoringCanvas({
  drawingId,
  color,
  tool,
  size,
  initialPaint,
  onChange,
  onNotice,
  ref,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const paintRef = useRef<HTMLCanvasElement>(null);
  const strokeRef = useRef<HTMLCanvasElement>(null);
  const wallRef = useRef<Uint8Array | null>(null);
  const undoRef = useRef<HTMLCanvasElement[]>([]);
  const drawing = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);

  const paintCtx = () => paintRef.current!.getContext("2d", { willReadFrequently: true })!;
  const strokeCtx = () => strokeRef.current!.getContext("2d")!;

  // 초기 그림 불러오기
  useEffect(() => {
    let cancelled = false;
    const ctx = paintCtx();
    ctx.clearRect(0, 0, ART_W, ART_H);
    if (initialPaint) {
      createImageBitmap(initialPaint).then((bmp) => {
        if (!cancelled) ctx.drawImage(bmp, 0, 0, ART_W, ART_H);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [initialPaint]);

  // 채우기용 벽(선) 마스크
  useEffect(() => {
    wallRef.current = null;
    const img = new Image();
    img.src = drawingSrc(drawingId);
    img.onload = () => {
      const lines = lineMaskFromImage(img, ART_W, ART_H);
      wallRef.current = dilate(lines, ART_W, ART_H, WALL_RADIUS);
    };
  }, [drawingId]);

  // 화면 크기 대비 캔버스 배율 (브러시 커서 표시용)
  useEffect(() => {
    const el = wrapRef.current!;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / ART_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pushUndo = () => {
    const snap = document.createElement("canvas");
    snap.width = ART_W;
    snap.height = ART_H;
    snap.getContext("2d")!.drawImage(paintRef.current!, 0, 0);
    undoRef.current.push(snap);
    if (undoRef.current.length > MAX_UNDO) undoRef.current.shift();
  };

  const glaze = (source: CanvasImageSource) => {
    const ctx = paintCtx();
    ctx.save();
    ctx.globalAlpha = GLAZE;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(source, 0, 0);
    ctx.restore();
  };

  const toArt = (e: { clientX: number; clientY: number }) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * ART_W,
      y: ((e.clientY - r.top) / r.height) * ART_H,
    };
  };

  const segment = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const doFill = (x: number, y: number) => {
    const wall = wallRef.current;
    if (!wall) return;
    const res = floodRegion(wall, ART_W, ART_H, Math.round(x), Math.round(y));
    if (!res) return;
    // 선 아래까지 색이 스며들도록 영역을 벽 두께만큼 넓힌다
    const grown = dilate(res.region, ART_W, ART_H, WALL_RADIUS + 2);
    const [r, g, b] = hexToRgb(color);
    const layer = document.createElement("canvas");
    layer.width = ART_W;
    layer.height = ART_H;
    const lctx = layer.getContext("2d")!;
    const img = lctx.createImageData(ART_W, ART_H);
    for (let i = 0; i < grown.length; i++) {
      if (!grown[i]) continue;
      const p = i * 4;
      img.data[p] = r;
      img.data[p + 1] = g;
      img.data[p + 2] = b;
      img.data[p + 3] = 255;
    }
    lctx.putImageData(img, 0, 0);
    pushUndo();
    glaze(layer);
    onChange();
    if (res.area > ART_W * ART_H * 0.4) {
      onNotice?.("선이 열린 곳으로 색이 넓게 번졌어요. 마음에 들지 않으면 되돌리기를 눌러주세요.");
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const p = toArt(e);
    if (tool === "fill") {
      doFill(p.x, p.y);
      return;
    }
    wrapRef.current!.setPointerCapture(e.pointerId);
    pushUndo();
    drawing.current = { x: p.x, y: p.y, px: p.x, py: p.y };
    if (tool === "brush") {
      const ctx = strokeCtx();
      ctx.clearRect(0, 0, ART_W, ART_H);
      ctx.strokeStyle = color;
      segment(ctx, p, { x: p.x + 0.01, y: p.y });
    } else {
      const ctx = paintCtx();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000";
      segment(ctx, p, { x: p.x + 0.01, y: p.y });
      ctx.restore();
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      const r = wrapRef.current!.getBoundingClientRect();
      setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
    }
    const d = drawing.current;
    if (!d) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    const erasing = tool === "eraser";
    const ctx = erasing ? paintCtx() : strokeCtx();
    ctx.save();
    if (erasing) ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = erasing ? "#000" : color;
    for (const ev of events) {
      const p = toArt(ev);
      // 중간점을 이어 부드러운 곡선으로
      const mx = (d.x + p.x) / 2;
      const my = (d.y + p.y) / 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(d.px, d.py);
      ctx.quadraticCurveTo(d.x, d.y, mx, my);
      ctx.stroke();
      d.px = mx;
      d.py = my;
      d.x = p.x;
      d.y = p.y;
    }
    ctx.restore();
  };

  const endStroke = () => {
    if (!drawing.current) return;
    drawing.current = null;
    if (tool === "brush") {
      glaze(strokeRef.current!);
      strokeCtx().clearRect(0, 0, ART_W, ART_H);
    }
    onChange();
  };

  const dominantColor = useCallback(() => {
    const data = paintCtx().getImageData(0, 0, ART_W, ART_H).data;
    const rgbs = PALETTE.map((c) => hexToRgb(c.hex));
    const counts = new Array(PALETTE.length).fill(0);
    let total = 0;
    for (let i = 0; i < data.length; i += 4 * 7) {
      if (data[i + 3] < 40) continue;
      total++;
      let best = 0;
      let bestD = Infinity;
      for (let k = 0; k < rgbs.length; k++) {
        const dr = data[i] - rgbs[k][0];
        const dg = data[i + 1] - rgbs[k][1];
        const db = data[i + 2] - rgbs[k][2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestD) {
          bestD = dist;
          best = k;
        }
      }
      counts[best]++;
    }
    if (total < 200) return null;
    return PALETTE[counts.indexOf(Math.max(...counts))].id;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      undo() {
        const snap = undoRef.current.pop();
        if (!snap) return;
        const ctx = paintCtx();
        ctx.clearRect(0, 0, ART_W, ART_H);
        ctx.drawImage(snap, 0, 0);
        onChange();
      },
      clear() {
        pushUndo();
        paintCtx().clearRect(0, 0, ART_W, ART_H);
        onChange();
      },
      canUndo: () => undoRef.current.length > 0,
      async exportPaint() {
        const data = paintCtx().getImageData(0, 0, ART_W, ART_H).data;
        let any = false;
        for (let i = 3; i < data.length; i += 4 * 5) {
          if (data[i] > 0) {
            any = true;
            break;
          }
        }
        if (!any) return null;
        return new Promise<Blob | null>((res) => paintRef.current!.toBlob(res, "image/png"));
      },
      dominantColor,
    }),
    [onChange, dominantColor],
  );

  const cursorPx = Math.max(size * scale, 6);

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      data-tool={tool}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onPointerLeave={() => setCursor(null)}
    >
      <canvas ref={paintRef} width={ART_W} height={ART_H} className={styles.layer} />
      <canvas
        ref={strokeRef}
        width={ART_W}
        height={ART_H}
        className={`${styles.layer} ${styles.stroke}`}
        style={{ opacity: GLAZE }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={drawingSrc(drawingId)} alt="오늘의 컬러링 도안" className={styles.lines} draggable={false} />
      {cursor && tool !== "fill" && (
        <span
          className={styles.cursor}
          style={{
            left: cursor.x,
            top: cursor.y,
            width: cursorPx,
            height: cursorPx,
            borderColor: tool === "eraser" ? "#8a8178" : color,
          }}
        />
      )}
    </div>
  );
}
