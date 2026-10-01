import { DEFAULT_CONTENT } from "./content";

export const backend = process.env.BACKEND_URL || "http://localhost:8000";

// Public pages: fresh within 10 seconds. Falls back to the starting content if the API is asleep.
export async function getContent(fresh = false) {
  try {
    const r = await fetch(`${backend}/content`, fresh ? { cache: "no-store" } : { next: { revalidate: 10 }, signal: AbortSignal.timeout(8000) });
    if (r.ok) return await r.json();
  } catch (e) {}
  return DEFAULT_CONTENT;
}
