
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

    const startTime = Date.now();
    const totalFiles = files.length;
    let completedFiles = 0;
    console.log(`\n\x1b[1m🚀 Starting batch conversion of ${files.length} files...\x1b[0m\n`);

    const logProgress = () => {
      const percent = Math.round((completedFiles / totalFiles) * 100);
      const bar = '█'.repeat(Math.floor(percent/4)) + '░'.repeat(25 - Math.floor(percent/4));
      console.log(`\x1b[36m[${bar}] ${percent}% | ${completedFiles}/${totalFiles} files\x1b[0m`);
    };
    
    logProgress();

    const results = await Promise.allSettled(
      files.map(async (file, index) => {
        try {
          const buffer = await file.arrayBuffer();
          console.log(`\n\x1b[33m[${index + 1}/${totalFiles}]\x1b[0m Processing ${file.name} (${(buffer.byteLength/1024).toFixed(1)}KB)`);
          const originalFileName = file.name;
          const fileNameWithoutExtension = originalFileName.split(".").slice(0, -1).join(".");

          const result = await convertFont(buffer);
          completedFiles++;
          logProgress();
          return {
            status: 'success',
            ...result,
            originalFileName: fileNameWithoutExtension,
          };
        } catch (error) {
          console.error(`Error converting ${file.name}:`, error);
          return {
            status: 'error',
            originalFileName: file.name,
            error: error.message
          };
        }
      })
    );

    console.log("Generating zip file...");
    const zip = new JSZip();
    const convertedFonts = results.map(result => {
      if (result.status === 'fulfilled' && result.value.status === 'success') {
        zip.file(`${result.value.originalFileName}.woff`, result.value.woff, { base64: true });
        if (result.value.woff2) {
          zip.file(`${result.value.originalFileName}.woff2`, result.value.woff2, { base64: true });
        }
        return result.value;
      }
      return {
        originalFileName: result.value.originalFileName,
        error: result.value.error,
        status: 'error'
      };
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
