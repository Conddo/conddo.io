// Direct-to-Cloudinary browser upload. Bypasses our own backend +
// Caddy + Cloudflare entirely for the file bytes — only the signature
// round-trip touches Conddo. Solves the 502s we saw on the proxied
// multipart path and scales better for larger files.

import { api, ApiError } from "./client";

type Signature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

export type UploadedFile = {
  url: string;
  publicId: string;
};

/** Upload a file straight to Cloudinary. Returns the permanent CDN URL
 *  the caller can then persist wherever it needs (KYC row, brand logo,
 *  invoice attachment). */
export async function uploadToCloudinary(
  file: File,
  folder: "kyc" | "logo" | "brand" | "website" | "product" | "media" | "social" | "creative" = "media",
): Promise<UploadedFile> {
  const sigRes = await api.get<Signature>(`/media/upload-signature?folder=${folder}`);
  const sig = sigRes.data;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  // Use /image/upload rather than /auto/upload — Cloudinary treats PDFs
  // as `image` resource type (same as the server-side CloudinaryObjectStorage
  // does) and /auto has stricter validation that rejects PDF on some plans.
  const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new ApiError("network_error", "Couldn't reach Cloudinary. Check your internet.");
  }
  if (!res.ok) {
    let msg = "Upload failed.";
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      msg = body.error?.message ?? msg;
    } catch {
      /* non-JSON body */
    }
    throw new ApiError("upload_failed", msg, res.status);
  }

  const payload = (await res.json()) as { secure_url: string; public_id: string };
  return { url: payload.secure_url, publicId: payload.public_id };
}
