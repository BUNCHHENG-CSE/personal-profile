export interface UploadResult {
  url: string;
  secure_url?: string;
  publicId?: string;
  format?: string;
  duration?: number;
  bytes?: number;
}

export interface UploadProgressCallback {
  (percent: number): void;
}

/**
 * Uploads a file to Cloudinary.
 * First tries direct browser upload using a server-generated signature (supports live progress and large files).
 * If direct upload is blocked or fails, falls back to the server-side upload proxy.
 */
export async function uploadToCloudinary(
  file: File,
  type: "avatar" | "banner" | "audio",
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> {
  // Strategy 1: Try direct signed upload to Cloudinary
  try {
    const signResponse = await fetch("/api/admin/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    if (signResponse.ok) {
      const signData = await signResponse.json();
      const { signature, timestamp, apiKey, cloudName, folder, resourceType } = signData;

      if (signature && apiKey && cloudName) {
        return await new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType || "auto"}/upload`;

          xhr.open("POST", uploadUrl);

          if (onProgress && xhr.upload) {
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
                onProgress(percent);
              }
            };
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (onProgress) onProgress(100);
                resolve({
                  url: response.secure_url || response.url,
                  secure_url: response.secure_url,
                  publicId: response.public_id,
                  format: response.format,
                  duration: response.duration,
                  bytes: response.bytes,
                });
              } catch (parseError) {
                reject(parseError);
              }
            } else {
              reject(new Error(`Direct Cloudinary upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during direct Cloudinary upload"));

          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", apiKey);
          formData.append("timestamp", String(timestamp));
          formData.append("signature", signature);
          if (folder) formData.append("folder", folder);

          xhr.send(formData);
        });
      }
    }
  } catch (directError) {
    console.warn("Direct Cloudinary upload failed, falling back to server upload:", directError);
  }

  // Strategy 2: Server-side upload fallback
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && (response.url || response.secure_url)) {
          if (onProgress) onProgress(100);
          resolve({
            url: response.secure_url || response.url,
            secure_url: response.secure_url,
            publicId: response.publicId,
            format: response.format,
            duration: response.duration,
            bytes: response.bytes,
          });
        } else {
          reject(new Error(response.error || "Server upload failed"));
        }
      } catch (err) {
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    xhr.send(formData);
  });
}
