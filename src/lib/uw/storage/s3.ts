import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const region = process.env.AWS_REGION || "us-east-1";
const bucket = process.env.UW_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export function isS3Configured(): boolean {
  return Boolean(bucket && accessKeyId && secretAccessKey);
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });
  }
  return _client;
}

export function buildDocumentKey(applicationId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const id = crypto.randomBytes(6).toString("hex");
  return `uw/${applicationId}/${Date.now()}-${id}-${safe}`;
}

export async function presignUpload(params: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<{ url: string; method: "PUT"; headers: Record<string, string> }> {
  if (!isS3Configured()) {
    // Mock-mode: route uploads through our local /api/uw/mock-upload sink.
    // The same key is stored in the DB so retrieval works once S3 is configured.
    return {
      url: `/api/uw/mock-upload?key=${encodeURIComponent(params.key)}`,
      method: "PUT",
      headers: { "Content-Type": params.contentType },
    };
  }
  const cmd = new PutObjectCommand({
    Bucket: bucket!,
    Key: params.key,
    ContentType: params.contentType,
    ServerSideEncryption: "AES256",
  });
  const url = await getSignedUrl(client(), cmd, {
    expiresIn: params.expiresInSeconds ?? 600,
  });
  return { url, method: "PUT", headers: { "Content-Type": params.contentType } };
}

export async function presignDownload(key: string, expiresInSeconds = 300): Promise<string> {
  if (!isS3Configured()) {
    return `/api/uw/mock-download?key=${encodeURIComponent(key)}`;
  }
  const cmd = new GetObjectCommand({ Bucket: bucket!, Key: key });
  return getSignedUrl(client(), cmd, { expiresIn: expiresInSeconds });
}

export async function deleteObject(key: string): Promise<void> {
  if (!isS3Configured()) return;
  await client().send(new DeleteObjectCommand({ Bucket: bucket!, Key: key }));
}
