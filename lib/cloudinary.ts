import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export function getCloudinaryConfig() {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(
    cloudName &&
      apiKey &&
      apiSecret &&
      cloudName !== "your_cloud_name" &&
      apiKey !== "your_api_key" &&
      apiSecret !== "your_api_secret",
  );
}

export function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET.",
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    resource_type?: "auto" | "image" | "video" | "raw";
    public_id?: string;
  } = {},
): Promise<UploadApiResponse> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "gaming-profile/media",
        resource_type: options.resource_type || "auto",
        public_id: options.public_id,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result);
        }
      },
    );
    uploadStream.end(buffer);
  });
}

export function signCloudinaryUpload(
  params: Record<string, string | number>,
): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder?: string;
  [key: string]: string | number | undefined;
} {
  configureCloudinary();
  const { apiKey, apiSecret, cloudName } = getCloudinaryConfig();

  const timestamp =
    typeof params.timestamp === "number"
      ? params.timestamp
      : Math.floor(Date.now() / 1000);

  const paramsToSign = {
    ...params,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret!);

  return {
    ...paramsToSign,
    signature,
    apiKey: apiKey!,
    cloudName: cloudName!,
  };
}
