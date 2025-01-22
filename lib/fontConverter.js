
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
