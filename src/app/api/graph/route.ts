import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { assets, relationships } from "@/server/db/schema";
import { requireSession } from "@/server/auth";
const edgeLabel = (type: string) => ({ HAS_MX: "MX", HAS_NAMESERVER: "NS", HAS_TXT: "DNS", HAS_SOA: "DNS", RESOLVES_TO: "DNS", PRESENTS_CERTIFICATE: "TLS", USES_PROVIDER: "USES", HOSTS_SERVICE: "HOSTS", CNAME_TO: "DNS", SUBDOMAIN_OF: "DNS" } as Record<string,string>)[type] ?? "LINK";
export async function GET() { const session = await requireSession(); const [nodes, edges] = await Promise.all([db.select().from(assets).where(eq(assets.tenantId, session.tenantId)), db.select().from(relationships).where(eq(relationships.tenantId, session.tenantId))]); return NextResponse.json([...nodes.map(n => ({ data: { id: n.id, label: n.type === "dns_record" ? "DNS record" : n.type === "tls_certificate" ? `TLS certificate ${n.displayName.slice(0, 10)}` : n.type === "infrastructure_provider" ? n.displayName : n.displayName, displayName: n.displayName, type: n.type, ownership: n.ownership, metadata: n.metadata, firstSeenAt: n.firstSeenAt, lastSeenAt: n.lastSeenAt } })), ...edges.map(e => ({ data: { id: e.id, source: e.sourceAssetId, target: e.targetAssetId, label: edgeLabel(e.type), relationshipType: e.type, qualifiers: e.qualifiers, confidence: e.confidence } }))]); }
