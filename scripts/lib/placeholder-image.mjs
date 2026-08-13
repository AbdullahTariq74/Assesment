import zlib from 'node:zlib';

// Minimal, dependency-free PNG encoder — used only to generate placeholder
// product photography for the seed catalog (see docs/BUILD-NOTES.md: this
// is a fictional brand with no real product photos). Draws a simple flat
// bottle silhouette with a transparent background and a label-window
// highlight, in the same visual language as the prototype's own base64 SVG
// product art (rounded cap + rounded body + a lighter inset "label" rect) —
// closer to a real product icon than a plain color swatch, and transparent
// so it drops cleanly onto any card background. One seed product
// deliberately gets no image at all, to exercise the theme's real
// "no image" placeholder state.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

/** True if (x, y) falls inside a rounded rectangle. */
function inRoundedRect(x, y, rx, ry, rw, rh, radius) {
  if (x < rx || x >= rx + rw || y < ry || y >= ry + rh) return false;
  const cx = Math.min(Math.max(x, rx + radius), rx + rw - radius);
  const cy = Math.min(Math.max(y, ry + radius), ry + rh - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Returns a base64-encoded RGBA PNG: a flat bottle silhouette (cap + body +
 * a lighter label window), vertical gradient between topHex/bottomHex,
 * transparent everywhere else.
 */
export function makePlaceholderPng(width, height, topHex, bottomHex) {
  const [tr, tg, tb] = hexToRgb(topHex);
  const [br, bg, bb] = hexToRgb(bottomHex);

  const capW = width * 0.34;
  const capH = height * 0.09;
  const capX = (width - capW) / 2;
  const capY = height * 0.03;
  const capRadius = capW * 0.28;

  const bodyW = width * 0.64;
  const bodyH = height * 0.84;
  const bodyX = (width - bodyW) / 2;
  const bodyY = capY + capH - height * 0.01;
  const bodyRadius = bodyW * 0.16;

  const labelW = bodyW * 0.62;
  const labelH = bodyH * 0.34;
  const labelX = (width - labelW) / 2;
  const labelY = bodyY + bodyH * 0.24;
  const labelRadius = labelW * 0.06;

  const rowBytes = width * 4 + 1; // +1 filter byte per scanline
  const raw = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const t = y / Math.max(height - 1, 1);
    const r = Math.round(tr + (br - tr) * t);
    const g = Math.round(tg + (bg - tg) * t);
    const b = Math.round(tb + (bb - tb) * t);
    const rowStart = y * rowBytes;
    raw[rowStart] = 0; // filter: none

    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      const inCap = inRoundedRect(x, y, capX, capY, capW, capH, capRadius);
      const inBody = inRoundedRect(x, y, bodyX, bodyY, bodyW, bodyH, bodyRadius);

      if (inCap || inBody) {
        const inLabel = inRoundedRect(x, y, labelX, labelY, labelW, labelH, labelRadius);
        if (inLabel) {
          raw[px] = 250;
          raw[px + 1] = 247;
          raw[px + 2] = 253;
          raw[px + 3] = 225;
        } else {
          raw[px] = r;
          raw[px + 1] = g;
          raw[px + 2] = b;
          raw[px + 3] = 255;
        }
      } else {
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const idat = zlib.deflateSync(raw);

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  return png.toString('base64');
}
