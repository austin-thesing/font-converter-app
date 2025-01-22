
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
      console.log("Starting WOFF2 conversion...");
      const compressionPromise = wawoff2.compress(new Uint8Array(buffer));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.log("WOFF2 conversion timed out after 5 seconds");
          reject(new Error("WOFF2 conversion timeout"));
        }, 5000)
      );
      
      woff2Buffer = await Promise.race([compressionPromise, timeoutPromise]);
      
      // Validate WOFF2 conversion
      if (!woff2Buffer || woff2Buffer.byteLength === 0) {
        throw new Error("WOFF2 conversion produced invalid output");
      }
      console.log(`WOFF2 conversion completed successfully: ${woff2Buffer.byteLength} bytes`);
    } catch (woff2Error) {
      console.warn("WOFF2 conversion failed:", woff2Error.message);
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
