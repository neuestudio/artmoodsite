// 손그림 도안은 선이 완전히 닫혀 있지 않아서, 선을 살짝 두껍게 만든 "벽"을 기준으로 영역을 찾는다.

export function lineMaskFromImage(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 60 ? 1 : 0;
  return mask;
}

// 정사각형 커널 팽창 (가로, 세로 두 번의 슬라이딩 윈도우)
export function dilate(mask: Uint8Array, w: number, h: number, r: number) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let count = 0;
    const row = y * w;
    for (let x = 0; x < Math.min(r, w); x++) count += mask[row + x];
    for (let x = 0; x < w; x++) {
      if (x + r < w) count += mask[row + x + r];
      if (x - r - 1 >= 0) count -= mask[row + x - r - 1];
      tmp[row + x] = count > 0 ? 1 : 0;
    }
  }
  for (let x = 0; x < w; x++) {
    let count = 0;
    for (let y = 0; y < Math.min(r, h); y++) count += tmp[y * w + x];
    for (let y = 0; y < h; y++) {
      if (y + r < h) count += tmp[(y + r) * w + x];
      if (y - r - 1 >= 0) count -= tmp[(y - r - 1) * w + x];
      out[y * w + x] = count > 0 ? 1 : 0;
    }
  }
  return out;
}

function nearestOpen(wall: Uint8Array, w: number, h: number, x: number, y: number, maxR: number) {
  if (!wall[y * w + x]) return [x, y] as const;
  for (let r = 1; r <= maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (!wall[ny * w + nx]) return [nx, ny] as const;
      }
    }
  }
  return null;
}

export function floodRegion(wall: Uint8Array, w: number, h: number, sx: number, sy: number) {
  const start = nearestOpen(wall, w, h, sx, sy, 14);
  if (!start) return null;
  const region = new Uint8Array(w * h);
  const stack: number[] = [start[0], start[1]];
  let area = 0;
  while (stack.length) {
    const y = stack.pop()!;
    let x = stack.pop()!;
    let i = y * w + x;
    while (x > 0 && !wall[i - 1] && !region[i - 1]) {
      x--;
      i--;
    }
    let up = false;
    let down = false;
    while (x < w && !wall[i] && !region[i]) {
      region[i] = 1;
      area++;
      if (y > 0) {
        const u = i - w;
        if (!wall[u] && !region[u]) {
          if (!up) {
            stack.push(x, y - 1);
            up = true;
          }
        } else up = false;
      }
      if (y < h - 1) {
        const d = i + w;
        if (!wall[d] && !region[d]) {
          if (!down) {
            stack.push(x, y + 1);
            down = true;
          }
        } else down = false;
      }
      x++;
      i++;
    }
  }
  return { region, area };
}
