import * as opentype from "opentype.js";
import * as wawoff2 from "wawoff2";

export async function convertFont(buffer) {
  const font = opentype.parse(buffer);

  // Convert to WOFF using opentype.js
  const woffBuffer = font.toBuffer({ type: "woff", metadata: { vendor: "YourApp" } });

  // Ensure wawoff2 is initialized
  if (typeof wawoff2.init === "function") {
    await wawoff2.init();
  }

  // Convert to WOFF2 using wawoff2
  const woff2Buffer = await wawoff2.compress(font.toArrayBuffer());

  return {
    woff: Buffer.from(woffBuffer).toString("base64"),
    woff2: Buffer.from(woff2Buffer).toString("base64"),
    originalSize: buffer.byteLength,
    woffSize: woffBuffer.byteLength,
    woff2Size: woff2Buffer.byteLength,
  };
}
