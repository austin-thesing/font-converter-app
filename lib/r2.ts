import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrlAWS } from "@aws-sdk/s3-request-presigner";

const CLOUDFLARE_R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const CLOUDFLARE_R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const CLOUDFLARE_R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const CLOUDFLARE_R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
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
    Bucket: CLOUDFLARE_R2_BUCKET_NAME,
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
