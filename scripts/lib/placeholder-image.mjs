import zlib from 'node:zlib';

// Minimal, dependency-free PNG encoder — used only to generate placeholder
// product photography for the seed catalog (see docs/BUILD-NOTES.md: this
// is a fictional brand with no real product photos, so each product gets
// a simple two-tone swatch in the brand palette instead of leaving every
// card blank). One seed product deliberately gets no image at all, to
// exercise the theme's real "no image" placeholder state.

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

/** Returns a base64-encoded PNG: a vertical two-tone gradient between
 * topHex and bottomHex, width x height pixels. */
export function makePlaceholderPng(width, height, topHex, bottomHex) {
  const [tr, tg, tb] = hexToRgb(topHex);
  const [br, bg, bb] = hexToRgb(bottomHex);

  const rowBytes = width * 3 + 1; // +1 filter byte per scanline
  const raw = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const t = y / Math.max(height - 1, 1);
    const r = Math.round(tr + (br - tr) * t);
    const g = Math.round(tg + (bg - tg) * t);
    const b = Math.round(tb + (bb - tb) * t);
    const rowStart = y * rowBytes;
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
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
