"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

let customIdChecked = false
async function ensureCustomIdColumn() {
  if (customIdChecked) return
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS custom_id VARCHAR(50);`
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_custom_id_type_user
    ON transactions(custom_id, type, user_id)
    WHERE custom_id IS NOT NULL;
  `
  customIdChecked = true
}

async function getNextCustomId(userId: number, type: "income" | "expense"): Promise<string> {
  const prefix = type === "income" ? "R" : "D"

  const result = await sql`
    SELECT custom_id FROM transactions 
    WHERE user_id = ${userId} AND type = ${type} AND custom_id IS NOT NULL
    ORDER BY custom_id DESC 
    LIMIT 1
  `

  if (result.length === 0) {
    return `${prefix}001`
  }

  const lastId = result[0].custom_id
  const number = Number.parseInt(lastId.slice(1)) + 1
  return `${prefix}${number.toString().padStart(3, "0")}`
}

export async function createTransaction(formData: FormData) {
  await ensureCustomIdColumn()
  const user = await requireAuth()

  const type = formData.get("type") as "income" | "expense"
  const customId = formData.get("customId") as string
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const date = formData.get("date") as string

  if (!type || !description || !amount || !date) {
    return { error: "Todos os campos são obrigatórios" }
  }

  if (amount <= 0) {
    return { error: "O valor deve ser maior que zero" }
  }

  try {
    const finalCustomId = customId || (await getNextCustomId(user.id, type))

    if (customId) {
      const existing = await sql`
        SELECT id FROM transactions 
        WHERE user_id = ${user.id} AND type = ${type} AND custom_id = ${customId}
      `

      if (existing.length > 0) {
        return { error: `ID ${customId} já existe para este tipo de transação` }
      }
    }

    await sql`
      INSERT INTO transactions (user_id, custom_id, type, description, amount, date)
      VALUES (${user.id}, ${finalCustomId}, ${type}, ${description}, ${amount}, ${date})
    `

    revalidatePath("/dashboard")
    revalidatePath("/data-entry")
    return { success: true }
  } catch (error) {
    console.error("Erro ao criar transação:", error)
    return { error: "Erro ao salvar transação" }
  }
}

export async function updateTransaction(id: number, formData: FormData) {
  await ensureCustomIdColumn()
  const user = await requireAuth()

  const type = formData.get("type") as "income" | "expense"
  const customId = formData.get("customId") as string
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const date = formData.get("date") as string

  if (!type || !customId || !description || !amount || !date) {
    return { error: "Todos os campos são obrigatórios" }
  }

  if (amount <= 0) {
    return { error: "O valor deve ser maior que zero" }
  }

  try {
    const existing = await sql`
      SELECT id FROM transactions 
      WHERE user_id = ${user.id} AND type = ${type} AND custom_id = ${customId} AND id != ${id}
    `

    if (existing.length > 0) {
      return { error: `ID ${customId} já existe para este tipo de transação` }
    }

    const result = await sql`
      UPDATE transactions 
      SET custom_id = ${customId}, type = ${type}, description = ${description}, amount = ${amount}, date = ${date}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${user.id}
    `

    if (result.count === 0) {
      return { error: "Transação não encontrada" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/data-entry")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar transação:", error)
    return { error: "Erro ao atualizar transação" }
  }
}

export async function deleteTransaction(id: number) {
  await ensureCustomIdColumn()
  const user = await requireAuth()

  try {
    const result = await sql`
      DELETE FROM transactions 
      WHERE id = ${id} AND user_id = ${user.id}
    `

    if (result.count === 0) {
      return { error: "Transação não encontrada" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/data-entry")
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar transação:", error)
    return { error: "Erro ao deletar transação" }
  }
}

export async function getTransactionsPaginated(
  page = 1,
  limit = 20,
  filter: "all" | "income" | "expense" = "all",
  search = "",
  sortBy = "custom_id",
  sortOrder: "asc" | "desc" = "asc",
) {
  await ensureCustomIdColumn()
  const user = await requireAuth()
  const offset = (page - 1) * limit

  try {
    // Construir query base
    let baseQuery = sql`
      SELECT * FROM transactions 
      WHERE user_id = ${user.id}
    `

    // Aplicar filtro de tipo
    if (filter !== "all") {
      baseQuery = sql`${baseQuery} AND type = ${filter}`
    }

    // Aplicar busca
    if (search) {
      baseQuery = sql`
        ${baseQuery} AND (
          description ILIKE ${"%" + search + "%"} OR
          custom_id ILIKE ${"%" + search + "%"} OR
          amount::text ILIKE ${"%" + search + "%"} OR
          date::text ILIKE ${"%" + search + "%"}
        )
      `
    }

    // Aplicar ordenação
    let orderClause
    if (sortBy === "custom_id") {
      // Ordena receitas antes de despesas e converte apenas IDs válidos (R/D + dígitos).
      orderClause = sql`
        ORDER BY
          CASE WHEN type = 'income' THEN 0 ELSE 1 END,
          CASE
            WHEN custom_id ~ '^[RD][0-9]+$'
              THEN CAST(NULLIF(SUBSTRING(custom_id FROM 2), '') AS INTEGER)
            ELSE NULL
          END ${sortOrder === "asc" ? sql`ASC` : sql`DESC`},
          custom_id ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
      `
    } else if (sortBy === "amount") {
      orderClause = sql`ORDER BY amount ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}`
    } else if (sortBy === "date") {
      orderClause = sql`ORDER BY date ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}`
    } else if (sortBy === "description") {
      orderClause = sql`ORDER BY description ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}`
    } else {
      orderClause = sql`ORDER BY created_at DESC`
    }

    const transactions = await sql`
      ${baseQuery}
      ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `

    // Contar total com os mesmos filtros
    let countQuery = sql`
      SELECT COUNT(*) as total FROM transactions 
      WHERE user_id = ${user.id}
    `

    if (filter !== "all") {
      countQuery = sql`${countQuery} AND type = ${filter}`
    }

    if (search) {
      countQuery = sql`
        ${countQuery} AND (
          description ILIKE ${"%" + search + "%"} OR
          custom_id ILIKE ${"%" + search + "%"} OR
          amount::text ILIKE ${"%" + search + "%"} OR
          date::text ILIKE ${"%" + search + "%"}
        )
      `
    }

    const countResult = await countQuery

    const total = Number(countResult[0].total)
    const totalPages = Math.ceil(total / limit)

    return {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  } catch (error) {
    console.error("Erro ao buscar transações:", error)
    return {
      transactions: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        total: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  }
}
