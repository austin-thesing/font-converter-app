
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
    let woff2Buffer = null;
    try {
      console.log("\x1b[36m[WOFF2]\x1b[0m Starting conversion...");
      const startTime = Date.now();
      woff2Buffer = await wawoff2.compress(new Uint8Array(buffer));
      
      if (!woff2Buffer || woff2Buffer.byteLength === 0) {
        throw new Error("Invalid WOFF2 output");
      }
      
      const duration = Date.now() - startTime;
      console.log(`\x1b[32m[WOFF2]\x1b[0m Conversion successful - ${(woff2Buffer.byteLength/1024).toFixed(1)}KB in ${duration}ms`);
    } catch (error) {
      console.log(`\x1b[31m[WOFF2]\x1b[0m Conversion failed - ${error.message}`);
      woff2Buffer = null;
    }

    // Convert to WOFF
    let compressedWoff, woffSize = 0;
    try {
      const woffBuffer = font.toArrayBuffer();
      compressedWoff = zlib.deflateSync(Buffer.from(woffBuffer));
      woffSize = compressedWoff.length;
      console.log(`WOFF conversion successful - ${(woffSize/1024).toFixed(1)}KB`);
    } catch (woffError) {
      console.error("WOFF conversion failed:", woffError);
      compressedWoff = null;
    }

    // Only return formats that were successfully converted
    const result = {
      originalSize: buffer.byteLength,
    };
    
    if (compressedWoff && compressedWoff.length > 0) {
      result.woff = compressedWoff.toString("base64");
      result.woffSize = compressedWoff.length;
    }
    
    if (woff2Buffer && woff2Buffer.byteLength > 0) {
      result.woff2 = Buffer.from(woff2Buffer).toString("base64");
      result.woff2Size = woff2Buffer.byteLength;
    }
    
    return result;
  } catch (error) {
    console.error("Font conversion error:", error);
    throw new Error(`Font conversion failed: ${error.message}`);
  }
}
