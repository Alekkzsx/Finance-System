"use server"

import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { hashPassword, verifyPassword, createSession, logout as logoutUser } from "@/lib/auth"

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "Todos os campos são obrigatórios" }
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres" }
  }

  try {
    // Verificar se o usuário já existe
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return { error: "Este email já está cadastrado" }
    }

    // Criar novo usuário
    const hashedPassword = await hashPassword(password)
    const users = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id
    `

    const userId = users[0].id
    await createSession(userId)
  } catch (error) {
    console.error("Erro no registro:", error)
    return { error: "Erro interno do servidor" }
  }

  redirect("/dashboard")
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" }
  }

  try {
    const users = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return { error: "Email ou senha incorretos" }
    }

    const user = users[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return { error: "Email ou senha incorretos" }
    }

    await createSession(user.id)
  } catch (error) {
    console.error("Erro no login:", error)
    return { error: "Erro interno do servidor" }
  }

  redirect("/dashboard")
}

export async function logout() {
  await logoutUser()
}
