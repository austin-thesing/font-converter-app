
import * as opentype from "opentype.js";
import wawoff2 from "wawoff2";
import * as zlib from "zlib";

export async function convertFont(buffer) {
  try {
    const font = opentype.parse(buffer);
    if (!font) {
      throw new Error("Failed to parse font");
    }

    // Convert to WOFF2 using wawoff2 first (more reliable)
    const woff2Buffer = await wawoff2.compress(new Uint8Array(buffer));
    if (!woff2Buffer) {
      throw new Error("WOFF2 conversion failed");
    }

    // Try to convert to WOFF, catch specific GSUB errors
    let compressedWoff;
    try {
      const woffBuffer = font.toArrayBuffer();
      compressedWoff = zlib.deflateSync(Buffer.from(woffBuffer));
    } catch (woffError) {
      // If WOFF conversion fails, use the original buffer
      console.warn("WOFF conversion failed, using original format:", woffError);
      compressedWoff = zlib.deflateSync(buffer);
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
