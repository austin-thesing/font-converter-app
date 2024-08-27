import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import JSZip from "jszip";
import path from "path";

const CLOUDFLARE_ENDPOINT = process.env.CLOUDFLARE_ENDPOINT;
const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const CLOUDFLARE_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const CLOUDFLARE_BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME;

if (!CLOUDFLARE_BUCKET_NAME) {
  throw new Error("CLOUDFLARE_BUCKET_NAME is not set in environment variables");
}

if (!CLOUDFLARE_ENDPOINT) {
  throw new Error("CLOUDFLARE_ENDPOINT is not set in environment variables");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

const PUBLIC_BUCKET_URL = process.env.PUBLIC_BUCKET_URL || "https://pub-afa0440f6e2a4e5682caebff99d28c7b.r2.dev";

function generateTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}_${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!CLOUDFLARE_BUCKET_NAME) {
      throw new Error("CLOUDFLARE_BUCKET_NAME is not set");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const fontName = file.name.split(".").slice(0, -1).join("."); // Remove file extension
    const timestamp = generateTimestamp();
    const folderName = `${fontName}_${timestamp}`;

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: `fonts/${folderName}/${file.name}`,
      Body: uint8Array,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Generate a public URL for the uploaded file
    const publicUrl = `${PUBLIC_BUCKET_URL}/fonts/${folderName}/${file.name}`;

    return NextResponse.json(
      {
        message: "File uploaded successfully to R2",
        folderKey: `fonts/${folderName}/${file.name}`,
        publicUrl,
        fileName: file.name,
        uploadTimestamp: timestamp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST function:", error);
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  try {
    // Get the font file from R2
    const getCommand = new GetObjectCommand({
      Bucket: CLOUDFLARE_BUCKET_NAME,
      Key: key,
    });

    const { Body, ContentType } = await s3Client.send(getCommand);

    if (!Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Create a ZIP file
    const zip = new JSZip();
    const fontName = path.basename(key, path.extname(key)); // Get font name without extension
    const fontExtension = path.extname(key);
    zip.file(`${fontName}${fontExtension}`, await Body.transformToByteArray());

    // Generate ZIP content
    const zipContent = await zip.generateAsync({ type: "uint8array" });

    // Create a new PUT command for the ZIP file
    const zipFileName = `${fontName}_converted.zip`;
    const zipKey = `${path.dirname(key)}/${zipFileName}`;
    const putCommand = new PutObjectCommand({
      Bucket: CLOUDFLARE_BUCKET_NAME,
      Key: zipKey,
      Body: zipContent,
      ContentType: "application/zip",
      ContentDisposition: `attachment; filename="${zipFileName}"`,
    });

    // Upload the ZIP file to R2
    await s3Client.send(putCommand);

    // Generate a public URL for the ZIP file
    const publicUrl = `${PUBLIC_BUCKET_URL}/${zipKey}`;

    return NextResponse.json({ url: publicUrl, filename: zipFileName });
  } catch (error) {
    console.error("Error in GET function:", error);
    return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
