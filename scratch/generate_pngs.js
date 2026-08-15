const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create uncompressed/compressed PNG image buffer
function createPng(width, height, getPixel) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdr);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcVal = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crcVal >>> 0, 8 + len);
  return buf;
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

function iconPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;

  const margin = w * 0.05;
  const rectW = w - 2 * margin;
  const cornerR = w * 0.2;
  
  const nx = Math.abs(x - cx) - (rectW / 2 - cornerR);
  const ny = Math.abs(y - cy) - (rectW / 2 - cornerR);
  const distCorner = Math.hypot(Math.max(0, nx), Math.max(0, ny));

  if (distCorner > cornerR) {
    return [0, 0, 0, 0];
  }

  const t = (x + y) / (w + h);
  let bgR = Math.round(2 + (3 - 2) * t);
  let bgG = Math.round(132 + (105 - 132) * t);
  let bgB = Math.round(199 + (161 - 199) * t);

  const sunX = w * 0.65;
  const sunY = h * 0.35;
  const sunR = w * 0.16;
  const distSun = Math.hypot(x - sunX, y - sunY);
  if (distSun < sunR) {
    return [251, 191, 36, 255];
  }

  const cloudCx = w * 0.48;
  const cloudCy = h * 0.58;
  const d1 = Math.hypot(x - (cloudCx - w * 0.12), y - cloudCy);
  const d2 = Math.hypot(x - cloudCx, y - (cloudCy - h * 0.08));
  const d3 = Math.hypot(x + (cloudCx + w * 0.12), y - cloudCy);
  const rectY = y >= cloudCy - h * 0.02 && y <= cloudCy + h * 0.12 && Math.abs(x - cloudCx) <= w * 0.22;

  if (d1 < w * 0.14 || d2 < w * 0.17 || d3 < w * 0.12 || rectY) {
    return [255, 255, 255, 255];
  }

  return [bgR, bgG, bgB, 255];
}

function ogPixel(x, y, w, h) {
  const tX = x / w;
  const tY = y / h;
  const t = (tX + tY) / 2;

  const bgR = Math.round(12 + (12 - 12) * t);
  const bgG = Math.round(61 + (135 - 61) * t);
  const bgB = Math.round(90 + (234 - 90) * t);

  const distSun = Math.hypot(x - w * 0.82, y - h * 0.28);
  if (distSun < 90) {
    return [251, 191, 36, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.join(__dirname, '..', 'public');

console.log('Generating PNG icons...');
const png192 = createPng(192, 192, iconPixel);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);

const png512 = createPng(512, 512, iconPixel);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

const ogPng = createPng(1200, 630, ogPixel);
fs.writeFileSync(path.join(publicDir, 'og.png'), ogPng);

console.log('PNG generation complete!');
