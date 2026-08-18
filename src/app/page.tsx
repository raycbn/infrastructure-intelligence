import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { assets, discoveryRuns, scopes } from "@/server/db/schema";
import { currentSession } from "@/server/auth";
import AuthPanel from "@/app/components/AuthPanel";
import DashboardClient from "@/app/components/DashboardClient";
export const dynamic = "force-dynamic";
export default async function Home() { const session = await currentSession(); if (!session) return <AuthPanel />; const [scopeRows, assetRows, runs] = await Promise.all([db.select().from(scopes).where(eq(scopes.tenantId, session.tenantId)), db.select().from(assets).where(eq(assets.tenantId, session.tenantId)), db.select().from(discoveryRuns).where(eq(discoveryRuns.tenantId, session.tenantId)).orderBy(desc(discoveryRuns.createdAt)).limit(5)]); const safeRuns = runs.map(run => ({ ...run, summary: run.summary && typeof run.summary === "object" ? run.summary as Record<string, number> : {} })); return <DashboardClient initialScopes={scopeRows} initialAssets={assetRows} initialRuns={safeRuns} />; }
