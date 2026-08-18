import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { assetObservations, assets } from "@/server/db/schema";
import { requireSession } from "@/server/auth";
import { redirect } from "next/navigation";
import AssetInventory from "@/app/components/AssetInventory";
export const dynamic = "force-dynamic";
export default async function AssetsPage() { const session = await (async () => { try { return await requireSession(); } catch { redirect("/"); } })(); const rows = await db.select().from(assets).where(eq(assets.tenantId, session.tenantId)).orderBy(desc(assets.lastSeenAt)); return <AssetInventory assets={rows.map(row => ({ ...row, metadata: row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {} }))} />; }
