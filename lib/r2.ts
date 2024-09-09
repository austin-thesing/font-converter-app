import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const CLOUDFLARE_ENDPOINT = process.env.CLOUDFLARE_ENDPOINT;
const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const CLOUDFLARE_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const CLOUDFLARE_BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME;
const PUBLIC_BUCKET_URL = process.env.PUBLIC_BUCKET_URL;

// Comment out the debug logging
// console.log('Environment variables:');
// console.log('CLOUDFLARE_ENDPOINT:', process.env.CLOUDFLARE_ENDPOINT);
// console.log('CLOUDFLARE_ACCESS_KEY_ID:', process.env.CLOUDFLARE_ACCESS_KEY_ID);
// console.log('CLOUDFLARE_SECRET_ACCESS_KEY:', process.env.CLOUDFLARE_SECRET_ACCESS_KEY);
// console.log('CLOUDFLARE_BUCKET_NAME:', process.env.CLOUDFLARE_BUCKET_NAME);

if (typeof window === "undefined") {
  // Server-side check
  if (!CLOUDFLARE_ENDPOINT || !CLOUDFLARE_ACCESS_KEY_ID || !CLOUDFLARE_SECRET_ACCESS_KEY || !CLOUDFLARE_BUCKET_NAME || !PUBLIC_BUCKET_URL) {
    console.error("Missing required Cloudflare R2 configuration");
  }
}

const s3Client =
  typeof window === "undefined"
    ? new S3Client({
        region: "auto",
        endpoint: CLOUDFLARE_ENDPOINT,
        credentials: {
          accessKeyId: CLOUDFLARE_ACCESS_KEY_ID!,
          secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY!,
        },
      })
    : null;

export async function uploadToR2(file: File | Blob, key: string) {
  if (!s3Client) {
    throw new Error("S3 client is not initialized");
  }

  let buffer: Buffer;
  const arrayBuffer = await file.arrayBuffer();
  buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: CLOUDFLARE_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: "application/zip",
  });

  await s3Client.send(command);

  return { url: `${PUBLIC_BUCKET_URL}/${key}` };
}

// Remove the getSignedUrl function as it's not being used
