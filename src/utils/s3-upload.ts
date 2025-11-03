import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import * as sharp from "sharp";
import * as dotenv from 'dotenv';
dotenv.config();

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME } = process.env;
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET_NAME) {
  throw new Error("AWS credentials are not set in environment variables!");
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(file: Express.Multer.File): Promise<string> {
  const fileKey = `uploads/${uuidv4()}.webp`;

  // Convert & compress to WebP
  const compressedBuffer = await sharp(file.buffer)
    .webp({
      quality: 75,       // Adjust WebP quality (0–100)
      effort: 4,         // Compression effort (0–6), higher = slower but smaller file
      lossless: false,   // true = lossless, false = lossy
    })
    .toBuffer();

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey,
    Body: compressedBuffer,
    ContentType: "image/webp",
  };

  await s3.send(new PutObjectCommand(uploadParams));
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
}
