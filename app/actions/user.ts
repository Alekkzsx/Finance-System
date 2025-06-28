"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { requireAuth, hashPassword, logout } from "@/lib/auth"

export async function updateUserName(formData: FormData) {
  const user = await requireAuth()
  const newName = formData.get("name") as string

  if (!newName || newName.trim().length < 2) {
    return { error: "Nome deve ter pelo menos 2 caracteres" }
  }

  try {
    await sql`
      UPDATE users 
      SET name = ${newName.trim()}
      WHERE id = ${user.id}
    `

    revalidatePath("/settings")
    return { success: true, message: "Nome atualizado com sucesso!" }
  } catch (error) {
    console.error("Erro ao atualizar nome:", error)
    return { error: "Erro ao atualizar nome" }
  }
}

export async function updateUserPassword(formData: FormData) {
  const user = await requireAuth()
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Todos os campos são obrigatórios" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "Nova senha e confirmação não coincidem" }
  }

  if (newPassword.length < 6) {
    return { error: "Nova senha deve ter pelo menos 6 caracteres" }
  }

  try {
    // Verificar senha atual
    const userResult = await sql`
      SELECT password_hash FROM users WHERE id = ${user.id}
    `

    if (userResult.length === 0) {
      return { error: "Usuário não encontrado" }
    }

    const bcrypt = await import("bcryptjs")
    const isValidPassword = await bcrypt.compare(currentPassword, userResult[0].password_hash)

    if (!isValidPassword) {
      return { error: "Senha atual incorreta" }
    }

    // Atualizar senha
    const hashedNewPassword = await hashPassword(newPassword)
    await sql`
      UPDATE users 
      SET password_hash = ${hashedNewPassword}
      WHERE id = ${user.id}
    `

    return { success: true, message: "Senha atualizada com sucesso!" }
  } catch (error) {
    console.error("Erro ao atualizar senha:", error)
    return { error: "Erro ao atualizar senha" }
  }
}

export async function logoutUser() {
  await logout()
}
