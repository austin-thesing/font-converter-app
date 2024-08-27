import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrlAWS } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(file: File | Blob, key: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
  });

  try {
    await s3Client.send(command);
    console.log(`File uploaded successfully to R2: ${key}`);
  } catch (error) {
    console.error("Error uploading file to R2:", error);
    throw error;
  }
}

export async function getSignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
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
