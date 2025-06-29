import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { sql } from "./db"
import type { User } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "change-me"
const secret = new TextEncoder().encode(JWT_SECRET)

/* ---------- password helpers ---------- */
export const hashPassword = (pwd: string) => bcrypt.hash(pwd, 12)
export const verifyPassword = (pwd: string, hash: string) => bcrypt.compare(pwd, hash)

/* ---------- session helpers ---------- */
export async function createSession(userId: number) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function getSession(): Promise<{ userId: number } | null> {
  const token = (await cookies()).get("session")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: number }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const s = await getSession()
  if (!s) return null
  const rows = await sql`SELECT id, email, name, created_at FROM users WHERE id = ${s.userId}`
  return (rows[0] as User) || null
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function logout() {
  const c = await cookies()
  c.delete("session")
  redirect("/login")
}
