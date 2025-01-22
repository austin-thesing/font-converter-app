
import * as opentype from "opentype.js";
import wawoff2 from "wawoff2";
import * as zlib from "zlib";

export async function convertFont(buffer) {
  try {
    const font = opentype.parse(buffer);
    if (!font) {
      throw new Error("Failed to parse font");
    }

    // Convert to WOFF using opentype.js and compress with zlib
    const woffBuffer = font.toArrayBuffer();
    const compressedWoff = zlib.deflateSync(Buffer.from(woffBuffer));

    // Convert to WOFF2 using wawoff2
    const woff2Buffer = await wawoff2.compress(new Uint8Array(buffer));
    if (!woff2Buffer) {
      throw new Error("WOFF2 conversion failed");
    }

    return {
      woff: compressedWoff.toString("base64"),
      woff2: Buffer.from(woff2Buffer).toString("base64"),
      originalSize: buffer.byteLength,
      woffSize: compressedWoff.length,
      woff2Size: woff2Buffer.byteLength,
    };
  } catch (error) {
    console.error("Font conversion error:", error);
    throw new Error(`Font conversion failed: ${error.message}`);
  }
}
