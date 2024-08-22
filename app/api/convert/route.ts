import { NextRequest, NextResponse } from "next/server";
import { convertFont } from "../../../lib/fontConverter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();

  try {
    const result = await convertFont(buffer);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Font conversion error:", error);
    return NextResponse.json({ error: "Font conversion failed" }, { status: 500 });
  }
}
