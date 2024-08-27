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

    return NextResponse.json(
      {
        message: "File uploaded successfully to R2",
        folderKey: `fonts/${folderName}/${file.name}`,
      },
      { status: 200 }
    );
  } catch (error) {
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
    console.log(`Attempting to retrieve file with key: ${key}`);

    // Get the font file from R2
    const getCommand = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    });

    let response;
    try {
      response = await s3Client.send(getCommand);
    } catch (error) {
      console.error(`Error retrieving file from R2: ${error}`);
      return NextResponse.json({ error: "File not found in R2" }, { status: 404 });
    }

    const { Body, ContentType } = response;

    if (!Body) {
      console.error(`File body is empty for key: ${key}`);
      return NextResponse.json({ error: "File content is empty" }, { status: 404 });
    }

    // Create a ZIP file
    const zip = new JSZip();
    const fontName = path.basename(key);
    zip.file(fontName, await Body.transformToByteArray());

    // Generate ZIP content
    const zipContent = await zip.generateAsync({ type: "uint8array" });

    // Extract the folder path and create a zip filename
    const folderPath = path.dirname(key);
    const zipFileName = `${path.basename(folderPath)}.zip`;
    const zipKey = `${folderPath}/${zipFileName}`;

    console.log(`Uploading zip file with key: ${zipKey}`);

    // Create a new PUT command for the ZIP file
    const putCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: zipKey,
      Body: zipContent,
      ContentType: "application/zip",
      ContentDisposition: `attachment; filename="${zipFileName}"`,
    });

    // Upload the ZIP file to R2
    try {
      await s3Client.send(putCommand);
    } catch (error) {
      console.error(`Error uploading zip file to R2: ${error}`);
      return NextResponse.json({ error: "Failed to upload zip file" }, { status: 500 });
    }

    console.log(`Generating signed URL for key: ${zipKey}`);

    // Generate a signed URL for the ZIP file
    let signedUrl;
    try {
      signedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
          Key: zipKey,
        }),
        { expiresIn: 3600 }
      );
    } catch (error) {
      console.error(`Error generating signed URL: ${error}`);
      return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
    }

    return NextResponse.json({ url: signedUrl, filename: zipFileName });
  } catch (error) {
    console.error(`Unexpected error in GET function: ${error}`);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
