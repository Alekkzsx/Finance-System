import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "change-me"
const secret = new TextEncoder().encode(JWT_SECRET)

const protectedRoutes = ["/dashboard", "/api/transactions"]
const publicRoutes = ["/login", "/register", "/"]

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtected = protectedRoutes.some((r) => path.startsWith(r))
  const isPublic = publicRoutes.includes(path)

  const token = req.cookies.get("session")?.value
  let authenticated = false
  if (token) {
    try {
      await jwtVerify(token, secret)
      authenticated = true
    } catch {
      authenticated = false
    }
  }

  if (isProtected && !authenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
  if (isPublic && authenticated && path !== "/") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
