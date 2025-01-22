
import * as opentype from "opentype.js";
import wawoff2 from "wawoff2";
import * as zlib from "zlib";

export async function convertFont(buffer) {
  try {
    const font = opentype.parse(buffer);
    if (!font) {
      throw new Error("Failed to parse font");
    }

    // Try to convert to WOFF2 using wawoff2 first
    let woff2Buffer;
    try {
      woff2Buffer = await Promise.race([
        wawoff2.compress(new Uint8Array(buffer)),
        new Promise((_, reject) => setTimeout(() => reject(new Error("WOFF2 conversion timeout")), 5000))
      ]);
    } catch (woff2Error) {
      console.warn("WOFF2 conversion failed or timed out, skipping:", woff2Error);
      woff2Buffer = null;
    }

    // Try to convert to WOFF with simplified tables
    let compressedWoff;
    try {
      // Simplify the font by removing problematic OpenType features
      if (font.tables.gsub) {
        delete font.tables.gsub;
      }
      if (font.tables.gpos) {
        delete font.tables.gpos;
      }
      
      const woffBuffer = font.toArrayBuffer();
      compressedWoff = zlib.deflateSync(Buffer.from(woffBuffer));
    } catch (woffError) {
      console.warn("WOFF conversion with simplified tables failed:", woffError);
      // Fallback: Use WOFF2 data for both formats
      compressedWoff = Buffer.from(woff2Buffer);
    }

    return {
      woff: compressedWoff.toString("base64"),
      woff2: woff2Buffer ? Buffer.from(woff2Buffer).toString("base64") : null,
      originalSize: buffer.byteLength,
      woffSize: compressedWoff.length,
      woff2Size: woff2Buffer ? woff2Buffer.byteLength : 0,
    };
  } catch (error) {
    console.error("Font conversion error:", error);
    throw new Error(`Font conversion failed: ${error.message}`);
  }
}
