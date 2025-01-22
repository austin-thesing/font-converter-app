
import { NextRequest, NextResponse } from "next/server";
import { convertFont } from "../../../lib/fontConverter";
import { uploadToR2 } from "../../../lib/r2";
import JSZip from "jszip";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files = Array.from(data.values()).filter((value) => value instanceof File) as File[];
    const conversionName = data.get("conversionName") as string;
    const timezone = data.get("timezone") as string;

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    console.log(`Starting conversion of ${files.length} files...`);

    const totalFiles = files.length;
    let completedFiles = 0;

    const convertedFonts = await Promise.all(
      files.map(async (file, index) => {
        try {
          console.log(`Starting conversion for file ${index + 1}/${totalFiles}: ${file.name}`);
          const buffer = await file.arrayBuffer();
          const originalFileName = file.name;
          console.log(`File ${file.name} loaded into buffer, size: ${buffer.byteLength} bytes`);
          const fileNameWithoutExtension = originalFileName.split(".").slice(0, -1).join(".");

          const result = await convertFont(buffer);
          console.log(`Successfully converted ${file.name}`);
          return {
            ...result,
            originalFileName: fileNameWithoutExtension,
          };
        } catch (error) {
          console.error(`Error converting ${file.name}:`, error);
          throw error;
        }
      })
    );

    console.log("Generating zip file...");
    const zip = new JSZip();
    convertedFonts.forEach((font) => {
      zip.file(`${font.originalFileName}.woff`, font.woff, { base64: true });
      zip.file(`${font.originalFileName}.woff2`, font.woff2, { base64: true });
    });
    const zipContent = await zip.generateAsync({ type: "blob" });

    const fontName = files[0].name.split(".")[0];
    const folderName = `${fontName}_${conversionName.replace("convertedfonts_", "")}`;
    const zipFileName = `${folderName}/convertedfonts_${conversionName.replace("convertedfonts_", "")}.zip`;

    console.log("Uploading to R2...");
    const { url: downloadUrl } = await uploadToR2(zipContent, zipFileName);

    console.log("Conversion complete");
    return NextResponse.json({ convertedFonts, downloadUrl });
  } catch (error) {
    console.error("Font conversion failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Font conversion failed" },
      { status: 500 }
    );
  }
}
