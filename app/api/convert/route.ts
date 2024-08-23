import { NextRequest, NextResponse } from "next/server";
import { convertFont } from "../../../lib/fontConverter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const files = Array.from(data.values()).filter((value) => value instanceof File) as File[];

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

    return NextResponse.json(convertedFonts);
  } catch (error) {
    console.error("Font conversion error:", error);
    return NextResponse.json({ error: "Font conversion failed" }, { status: 500 });
  }
}
