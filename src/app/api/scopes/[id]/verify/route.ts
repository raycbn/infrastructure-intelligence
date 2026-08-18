import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { auditEvents, scopes } from "@/server/db/schema";
import { requireSession } from "@/server/auth";
import { verifyScope } from "@/server/verification";
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) { try { const session = await requireSession(); const { id } = await params; const [scope] = await db.select().from(scopes).where(and(eq(scopes.id, id), eq(scopes.tenantId, session.tenantId))); if (!scope) return NextResponse.json({ error: "Not found" }, { status: 404 }); const method = scope.verificationMethod ?? "dns_txt"; const verified = await verifyScope(id, scope.domain, method as "dns_txt" | "http"); if (verified) await db.insert(auditEvents).values({ tenantId: session.tenantId, userId: session.userId, action: "scope.verified", targetType: "scope", targetId: id, metadata: { method } }); return NextResponse.json({ verified }); } catch (error) { const detail = error instanceof Error ? error.message : "Unknown verification error"; console.error("Scope verification failed", { message: detail, code: (error as { code?: string })?.code }); return NextResponse.json({ error: "Verification failed", ...(process.env.NODE_ENV !== "production" ? { detail } : {}) }, { status: 400 }); } }
