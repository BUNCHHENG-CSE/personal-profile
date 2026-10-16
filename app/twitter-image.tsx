import { GET } from "./api/og/route";

export const runtime = "nodejs";
export const alt = "Gamer Profile Sanctum Card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return GET();
}
