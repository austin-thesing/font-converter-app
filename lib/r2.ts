import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrlAWS } from "@aws-sdk/s3-request-presigner";

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

export async function uploadToR2(file: File | Blob, key: string) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

export async function getSignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: CLOUDFLARE_BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrlAWS(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
}
