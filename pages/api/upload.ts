import { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Upload request received:", req.query);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { key } = req.query;
  const file = req.body; // Assuming the file is sent in the request body

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME, // Make sure this is set
      Key: key as string,
      Body: file,
    });

    await s3Client.send(command);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
}
