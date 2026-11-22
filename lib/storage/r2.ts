import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path'

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
  )
}

let s3Client: S3Client | null = null

function getR2Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  }
  return s3Client
}

/**
 * Uploads a buffer to Cloudflare R2 (0-egress) if configured,
 * or falls back to `public/previews/<key>` in local development.
 */
export async function uploadPreviewAsset(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const normalizedKey = key.replace(/^\/+/, '')
  if (!normalizedKey || normalizedKey.includes('..') || normalizedKey.includes('\\')) {
    throw new Error('Invalid storage key')
  }

  if (isR2Configured()) {
    const client = getR2Client()
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: normalizedKey,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    )
    const baseUrl = process.env.R2_PUBLIC_URL!.replace(/\/+$/, '')
    return `${baseUrl}/${normalizedKey}`
  }

  // Local dev fallback: write under public/previews so Next.js serves it at /previews/...
  // On read-only serverless hosts (e.g. Vercel without R2), fall back to a data URI for small assets.
  try {
    const baseDir = path.resolve(process.cwd(), 'public', 'previews')
    const localPath = path.resolve(baseDir, normalizedKey)
    if (!localPath.startsWith(`${baseDir}${path.sep}`)) {
      throw new Error('Invalid storage path')
    }
    await fs.mkdir(path.dirname(localPath), { recursive: true })
    await fs.writeFile(localPath, body)
    return `/previews/${normalizedKey}`
  } catch {
    return `data:${contentType};base64,${body.toString('base64')}`
  }
}
