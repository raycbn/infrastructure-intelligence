import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { assets, discoveryRuns } from "@/server/db/schema";
import { requireSession } from "@/server/auth";
export async function GET(request: Request) { try { const session = await requireSession(); const runId = new URL(request.url).searchParams.get("runId"); if (!runId) return NextResponse.json({ error: "runId is required" }, { status: 400 }); const [run] = await db.select().from(discoveryRuns).where(and(eq(discoveryRuns.id, runId), eq(discoveryRuns.tenantId, session.tenantId))); if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 }); const runAssets = await db.select().from(assets).where(and(eq(assets.tenantId, session.tenantId), eq(assets.scopeId, run.scopeId))); return NextResponse.json({ run, assets: runAssets }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read discovery status" }, { status: 400 }); } }
