import * as opentype from "opentype.js";
import wawoff2 from "wawoff2";
import * as zlib from "zlib";

export async function convertFont(buffer) {
  const font = opentype.parse(buffer);

  // Convert to WOFF using opentype.js and compress with zlib
  const woffBuffer = font.toArrayBuffer();
  const compressedWoff = zlib.deflateSync(Buffer.from(woffBuffer));

  // Convert to WOFF2 using wawoff2
  const woff2Buffer = await wawoff2.compress(new Uint8Array(buffer));

  return {
    woff: compressedWoff.toString("base64"),
    woff2: Buffer.from(woff2Buffer).toString("base64"),
    originalSize: buffer.byteLength,
    woffSize: compressedWoff.length,
    woff2Size: woff2Buffer.byteLength,
  };
}
