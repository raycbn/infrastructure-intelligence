import { and, desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { assetObservations, assets } from "@/server/db/schema";
import { requireSession } from "@/server/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) { const session = await (async () => { try { return await requireSession(); } catch { redirect("/"); } })(); const { id } = await params; const [asset] = await db.select().from(assets).where(and(eq(assets.id, id), eq(assets.tenantId, session.tenantId))); if (!asset) return <section>Not found</section>; const observations = await db.select().from(assetObservations).where(eq(assetObservations.assetId, id)).orderBy(desc(assetObservations.observedAt)); return <section><h1>{asset.displayName}</h1><p>{asset.type} · first seen {asset.firstSeenAt.toISOString()}</p><h2>Evidence</h2>{observations.map(o => <article key={o.id}><b>{o.source}</b> — confidence {o.confidence}/100 <pre>{JSON.stringify({ raw: o.rawValue, normalized: o.normalizedValue, evidence: o.evidence }, null, 2)}</pre></article>)}</section>; }
