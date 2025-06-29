"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { hashPassword, verifyPassword, createSession } from "@/lib/auth"

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Basic validation
  if (!name || !email || !password) {
    return { error: "Todos os campos são obrigatórios" }
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres" }
  }

  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return { error: "Este email já está cadastrado" }
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id
    `

    const userId = result[0].id

    // Create session
    await createSession(userId)
  } catch (error) {
    console.error("Erro no registro:", error)
    return { error: "Erro interno do servidor. Tente novamente." }
  }

  redirect("/dashboard")
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Basic validation
  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" }
  }

  try {
    // Find user by email
    const users = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return { error: "Credenciais inválidas" }
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return { error: "Credenciais inválidas" }
    }

    // Create session
    await createSession(user.id)
  } catch (error) {
    console.error("Erro no login:", error)
    return { error: "Erro interno do servidor. Tente novamente." }
  }

  redirect("/dashboard")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/login")
}
