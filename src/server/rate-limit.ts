import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { rateLimits } from "@/server/db/schema";
export async function takeRateLimit(key: string, max = 5) { const windowStart = new Date(); windowStart.setMinutes(0, 0, 0); const [row] = await db.select().from(rateLimits).where(and(eq(rateLimits.key, key), eq(rateLimits.windowStart, windowStart))); if (row && row.count >= max) throw new Error("Rate limit exceeded"); if (row) await db.update(rateLimits).set({ count: row.count + 1 }).where(eq(rateLimits.id, row.id)); else await db.insert(rateLimits).values({ key, windowStart, count: 1 }); }
