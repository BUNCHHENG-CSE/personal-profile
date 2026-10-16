import { admin, body, failure, json, rateLimit, sameOrigin } from "@/lib/security";
import { isCloudinaryConfigured, signCloudinaryUpload } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET() {
  if (!(await admin())) return failure("Unauthorized", 401);
  return json({
    configured: isCloudinaryConfigured(),
  });
}

export async function POST(request: Request) {
  if (!(await admin())) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);

  try {
    if (!(await rateLimit(request, "admin-upload-sign", 60, 60))) {
      return failure("Too many upload requests. Please slow down.", 429);
    }

    if (!isCloudinaryConfigured()) {
      return failure(
        "Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.",
        503,
      );
    }

    let type = "media";
    try {
      const payload = (await body(request, 1024)) as { type?: string } | null;
      if (payload?.type && ["avatar", "banner", "audio"].includes(payload.type)) {
        type = payload.type;
      }
    } catch {
      // Body is optional
    }

    const folder = `gaming-profile/${type}`;
    const timestamp = Math.floor(Date.now() / 1000);

    const signed = signCloudinaryUpload({
      folder,
      timestamp,
    });

    return json({
      signature: signed.signature,
      timestamp: signed.timestamp,
      apiKey: signed.apiKey,
      cloudName: signed.cloudName,
      folder: signed.folder,
      resourceType: type === "audio" ? "video" : "auto",
    });
  } catch (error) {
    console.error("Upload sign error:", error);
    return failure("Could not sign upload request", 500);
  }
}
