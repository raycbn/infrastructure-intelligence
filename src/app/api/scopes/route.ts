import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auditEvents, scopes } from "@/server/db/schema";
import { requireSession } from "@/server/auth";
import { normalizeDomain } from "@/server/discovery/security";
import { createChallenge } from "@/server/verification";
export async function POST(request: Request) { try { const session = await requireSession(); const { domain, method = "dns_txt" } = await request.json(); if (method !== "dns_txt" && method !== "http") throw new Error("Invalid verification method"); const normalized = normalizeDomain(domain); const [scope] = await db.insert(scopes).values({ tenantId: session.tenantId, domain: normalized, verificationMethod: method }).returning(); const token = await createChallenge(scope.id, method); await db.insert(auditEvents).values({ tenantId: session.tenantId, userId: session.userId, action: "scope.created", targetType: "scope", targetId: scope.id, metadata: { domain: normalized, method } }); return NextResponse.json({ scope, verification: method === "dns_txt" ? { record: `_infrastructure-intelligence.${normalized}`, value: token } : { path: "/.well-known/infrastructure-intelligence-verification.txt", value: token } }, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Bad request" }, { status: 400 }); } }
