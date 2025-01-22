
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
      const compressionPromise = wawoff2.compress(new Uint8Array(buffer));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 5000)
      );
      
      woff2Buffer = await Promise.race([compressionPromise, timeoutPromise]);
      
      if (!woff2Buffer || woff2Buffer.byteLength === 0) {
        throw new Error("Invalid output");
      }
      
      const duration = Date.now() - startTime;
      console.log(`\x1b[32m[WOFF2]\x1b[0m Conversion successful - ${(woff2Buffer.byteLength/1024).toFixed(1)}KB in ${duration}ms`);
      return woff2Buffer;
    } catch (error) {
      console.log(`\x1b[31m[WOFF2]\x1b[0m Conversion failed - ${error.message}`);
      return null;
    }

    // Convert to WOFF
    let compressedWoff;
    try {
      const woffBuffer = font.toArrayBuffer();
      compressedWoff = zlib.deflateSync(Buffer.from(woffBuffer));
      console.log(`WOFF conversion successful - ${(compressedWoff.length/1024).toFixed(1)}KB`);
    } catch (woffError) {
      console.error("WOFF conversion failed:", woffError);
      compressedWoff = null;
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
