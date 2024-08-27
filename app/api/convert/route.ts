import { NextRequest, NextResponse } from "next/server";
import { convertFont } from "../../../lib/fontConverter";
import { uploadToR2 } from "../../../lib/r2";
import JSZip from "jszip";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const files = Array.from(data.values()).filter((value) => value instanceof File) as File[];
  const conversionName = data.get("conversionName") as string;
  const timezone = data.get("timezone") as string;

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  try {
    const convertedFonts = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const originalFileName = file.name;
        const fileNameWithoutExtension = originalFileName.split(".").slice(0, -1).join(".");

        const { woff, woff2, originalSize, woffSize, woff2Size } = await convertFont(buffer);

        return {
          woff,
          woff2,
          originalSize,
          woffSize,
          woff2Size,
          originalFileName: fileNameWithoutExtension,
        };
      })
    );

    // Generate zip file
    const zip = new JSZip();
    convertedFonts.forEach((font) => {
      zip.file(`${font.originalFileName}.woff`, font.woff, { base64: true });
      zip.file(`${font.originalFileName}.woff2`, font.woff2, { base64: true });
    });
    const zipContent = await zip.generateAsync({ type: "blob" });

    // Create folder name with font name and readable timestamp
    const fontName = files[0].name.split(".")[0]; // Use the first font's name
    const folderName = `${fontName}_${conversionName.replace("convertedfonts_", "")}`;

    // Upload zip file
    const zipFileName = `${folderName}/convertedfonts_${conversionName.replace("convertedfonts_", "")}.zip`;
    const { url: downloadUrl } = await uploadToR2(zipContent, zipFileName);

    // Upload original files
    await Promise.all(
      files.map(async (file) => {
        const originalFileName = `${folderName}/${file.name}`;
        await uploadToR2(file, originalFileName);
      })
    );

    return NextResponse.json({ convertedFonts, downloadUrl });
  } catch (error) {
    console.error("Font conversion error:", error);
    return NextResponse.json({ error: "Font conversion failed" }, { status: 500 });
  }
}
