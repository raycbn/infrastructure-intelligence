import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "development-only-secret-change-me-please");
export type Session = { userId: string; tenantId: string; role: string };
export async function createSession(value: Session) { return new SignJWT(value).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret()); }
export async function currentSession(): Promise<Session | undefined> { const token = (await cookies()).get("ii_session")?.value; if (!token) return; try { return (await jwtVerify(token, secret())).payload as unknown as Session; } catch { return; } }
export async function requireSession() { const session = await currentSession(); if (!session) throw new Error("Unauthorized"); return session; }
