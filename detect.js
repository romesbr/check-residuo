// Detecção de milho por cor (HSV) — JavaScript puro
const decodeJpeg = require('jpeg-js/lib/decoder');

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Uint8Array(256);
for (let i = 0; i < B64.length; i++) LOOKUP[B64.charCodeAt(i)] = i;

function base64ToBytes(b64) {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = clean.length;
  const out = new Uint8Array(Math.floor((len * 3) / 4));
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const a = LOOKUP[clean.charCodeAt(i)];
    const b = LOOKUP[clean.charCodeAt(i + 1)];
    const c = LOOKUP[clean.charCodeAt(i + 2)];
    const d = LOOKUP[clean.charCodeAt(i + 3)];
    out[p++] = (a << 2) | (b >> 4);
    if (i + 2 < len) out[p++] = ((b & 15) << 4) | (c >> 2);
    if (i + 3 < len) out[p++] = ((c & 3) << 6) | d;
  }
  return out.subarray(0, p);
}

// Faixa de cor do milho (amarelo/alaranjado). Ajustável.
const DEFAULT_CFG = { hMin: 30, hMax: 60, sMin: 0.40, vMin: 0.40, cellMinFrac: 0.30, minCells: 2, grid: 24 };

function isCorn(r, g, b, cfg) {
  const max = r > g ? (r > b ? r : b) : (g > b ? g : b);
  const min = r < g ? (r < b ? r : b) : (g < b ? g : b);
  const v = max / 255;
  if (v < cfg.vMin || max === 0) return false;
  const delta = max - min;
  const s = delta / max;
  if (s < cfg.sMin) return false;
  let h;
  if (max === r) h = 60 * (((g - b) / delta) % 6);
  else if (max === g) h = 60 * ((b - r) / delta + 2);
  else h = 60 * ((r - g) / delta + 4);
  if (h < 0) h += 360;
  return h >= cfg.hMin && h <= cfg.hMax;
}

// Retorna boxes normalizadas (0..1) em orientação retrato
function detectFromBase64(b64, userCfg) {
  const cfg = Object.assign({}, DEFAULT_CFG, userCfg || {});
  const img = decodeJpeg(base64ToBytes(b64), { useTArray: true, formatAsRGBA: true });
  const W = img.width, H = img.height, data = img.data;
  const rotated = W > H; // sensor em paisagem → girar para retrato

  // Dimensões lógicas em retrato
  const PW = rotated ? H : W;
  const PH = rotated ? W : H;
  const cols = cfg.grid;
  const cellSize = PW / cols;
  const rows = Math.max(1, Math.round(PH / cellSize));
  const hits = new Float32Array(cols * rows);
  const counts = new Float32Array(cols * rows);
  const step = Math.max(1, Math.floor(Math.min(W, H) / 160)); // amostragem
  let totalCorn = 0, totalPx = 0;

  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const i = (y * W + x) * 4;
      const corn = isCorn(data[i], data[i + 1], data[i + 2], cfg);
      // coordenadas em retrato (rotação 90° horária)
      const px = rotated ? (H - 1 - y) : x;
      const py = rotated ? x : y;
      const cx = Math.min(cols - 1, Math.floor((px / PW) * cols));
      const cy = Math.min(rows - 1, Math.floor((py / PH) * rows));
      const k = cy * cols + cx;
      counts[k]++;
      totalPx++;
      if (corn) { hits[k]++; totalCorn++; }
    }
  }

  // Células "quentes"
  const hot = new Uint8Array(cols * rows);
  for (let k = 0; k < hot.length; k++) {
    if (counts[k] > 0 && hits[k] / counts[k] >= cfg.cellMinFrac) hot[k] = 1;
  }

  // Agrupamento (flood fill 8-vizinhos)
  const seen = new Uint8Array(cols * rows);
  const boxes = [];
  for (let k = 0; k < hot.length; k++) {
    if (!hot[k] || seen[k]) continue;
    const stack = [k];
    seen[k] = 1;
    let minX = cols, minY = rows, maxX = -1, maxY = -1, n = 0, fracSum = 0;
    while (stack.length) {
      const c = stack.pop();
      const cx = c % cols, cy = (c / cols) | 0;
      n++; fracSum += hits[c] / counts[c];
      if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const nk = ny * cols + nx;
        if (hot[nk] && !seen[nk]) { seen[nk] = 1; stack.push(nk); }
      }
    }
    if (n >= cfg.minCells) {
      boxes.push({
        x: minX / cols, y: minY / rows,
        w: (maxX - minX + 1) / cols, h: (maxY - minY + 1) / rows,
        conf: Math.round((fracSum / n) * 100), cells: n,
      });
    }
  }
  boxes.sort((a, b) => b.cells - a.cells);
  return { boxes: boxes.slice(0, 10), width: W, height: H, rotated, cornPct: totalPx ? (totalCorn / totalPx) * 100 : 0 };
}

module.exports = { detectFromBase64, DEFAULT_CFG };
