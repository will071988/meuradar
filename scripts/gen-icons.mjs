// Gera ícones PWA do MeuRadar sem dependências (usa apenas node:zlib).
// Design: fundo azul profundo, anéis ciano, ponto central branco + feixe laranja.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function draw(size) {
  const buf = Buffer.alloc(size * size * 4);
  const [br, bg, bb] = hex("#0B2D5B");
  const [cr, cg, cb] = hex("#00C2D7");
  const [or, og, ob] = hex("#FF8A3D");
  const c = size / 2;
  const R = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c + 0.5;
      const dy = y - c + 0.5;
      const d = Math.sqrt(dx * dx + dy * dy);
      const i = (y * size + x) * 4;
      if (d > R) {
        buf[i + 3] = 0; // transparente fora do círculo (maskable-safe)
        continue;
      }
      let r = br, g = bg, b = bb;
      // anéis ciano
      for (const [rr, w] of [[R * 0.72, size * 0.035], [R * 0.45, size * 0.035]]) {
        if (Math.abs(d - rr) < w) { r = cr; g = cg; b = cb; }
      }
      // feixe laranja (cunha superior-direita)
      const ang = (Math.atan2(-dy, dx) * 180) / Math.PI; // -180..180, 0 = direita
      if (d < R * 0.8 && ang > 20 && ang < 65) { r = or; g = og; b = ob; }
      // ponto central branco + miolo laranja
      if (d < R * 0.12) { r = 255; g = 255; b = 255; }
      if (d < R * 0.055) { r = or; g = og; b = ob; }
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
    }
  }
  return buf;
}

for (const size of [180, 192, 512]) {
  const png = encodePng(size, draw(size));
  const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  writeFileSync(join(outDir, name), png);
  console.log(`icons/${name} (${png.length} bytes)`);
}
