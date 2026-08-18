import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { memberships, users } from "@/server/db/schema";
import { createSession } from "@/server/auth";
export async function POST(request: Request) { const { email, password } = await request.json(); const [user] = await db.select().from(users).where(eq(users.email, String(email).toLowerCase())); if (!user || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 }); const [membership] = await db.select().from(memberships).where(eq(memberships.userId, user.id)); if (!membership) return NextResponse.json({ error: "No organization" }, { status: 403 }); const token = await createSession({ userId: user.id, tenantId: membership.tenantId, role: membership.role }); const response = NextResponse.json({ ok: true }); response.cookies.set("ii_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" }); return response; }
