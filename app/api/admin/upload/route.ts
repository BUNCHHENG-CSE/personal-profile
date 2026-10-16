import { admin, failure, json, rateLimit, sameOrigin } from "@/lib/security";
import { isCloudinaryConfigured, uploadBufferToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 30 * 1024 * 1024; // 30MB

export async function POST(request: Request) {
  if (!(await admin())) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);

  try {
    if (!(await rateLimit(request, "admin-upload", 30, 60))) {
      return failure("Too many upload requests. Please slow down.", 429);
    }

    if (!isCloudinaryConfigured()) {
      return failure(
        "Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.",
        503,
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "media";

    if (!file || typeof file === "string") {
      return failure("No file provided for upload.", 400);
    }

    const isAudio = type === "audio" || file.type.startsWith("audio/");
    const maxAllowedSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxAllowedSize) {
      return failure(
        `File is too large. Maximum size for ${isAudio ? "audio is 30MB" : "images is 10MB"}.`,
        400,
      );
    }

    if (isAudio) {
      const validAudioTypes = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/ogg",
        "audio/vorbis",
        "audio/x-m4a",
        "audio/m4a",
        "audio/aac",
        "audio/flac",
        "audio/webm",
      ];
      const validExtension = /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name);
      if (!file.type.startsWith("audio/") && !validAudioTypes.includes(file.type) && !validExtension) {
        return failure("Invalid audio file format. Supported formats: MP3, WAV, OGG, M4A, AAC, FLAC.", 400);
      }
    } else {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "image/avif",
      ];
      const validExtension = /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name);
      if (!file.type.startsWith("image/") && !validImageTypes.includes(file.type) && !validExtension) {
        return failure("Invalid image file format. Supported formats: JPG, PNG, WEBP, GIF, SVG.", 400);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = `gaming-profile/${type}`;
    const resourceType = isAudio ? "video" : "auto";

    const result = await uploadBufferToCloudinary(buffer, {
      folder,
      resource_type: resourceType,
    });

    return json({
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration,
      resourceType: result.resource_type,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload file.";
    return failure(message, 500);
  }
}
