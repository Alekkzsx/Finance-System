import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { sql } from "./db"
import type { User } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production"
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getSession(): Promise<{ userId: number } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: number }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null

  try {
    const users = await sql`
      SELECT id, email, name, created_at 
      FROM users 
      WHERE id = ${session.userId}
    `
    return (users[0] as User) || null
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/login")
}
