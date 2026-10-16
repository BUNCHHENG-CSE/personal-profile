import { publicProfile } from "@/lib/data";
import { json } from "@/lib/security";
export const runtime = "nodejs";
export async function GET() {
  try {
    return json({ data: await publicProfile() });
  } catch (error) {
    console.error("profile GET", error);
    return json({ error: "Profile unavailable" }, 503);
  }
}
