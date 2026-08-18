import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { auditEvents, discoveryRuns, scopes } from "@/server/db/schema";
import { requireSession } from "@/server/auth";
import { enqueue } from "@/server/jobs";
import { takeRateLimit } from "@/server/rate-limit";
export async function POST(request: Request) { try { const session = await requireSession(); const { scopeId } = await request.json(); const [scope] = await db.select().from(scopes).where(and(eq(scopes.id, scopeId), eq(scopes.tenantId, session.tenantId))); if (!scope || scope.status !== "verified") return NextResponse.json({ error: "A verified scope is required" }, { status: 403 }); await takeRateLimit(`discovery:${session.tenantId}`, 5); const [run] = await db.insert(discoveryRuns).values({ tenantId: session.tenantId, scopeId: scope.id }).returning(); await enqueue(session.tenantId, "discovery", { runId: run.id }); await db.insert(auditEvents).values({ tenantId: session.tenantId, userId: session.userId, action: "discovery.started", targetType: "discovery_run", targetId: run.id, metadata: { scope: scope.domain } }); return NextResponse.json(run, { status: 202 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not start discovery" }, { status: 400 }); } }
