"use server"

import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import type { DashboardStats } from "@/lib/db"

export async function getDashboardStats(filter: "all" | "income" | "expense" = "all"): Promise<DashboardStats> {
  const user = await requireAuth()

  try {
    // Estatísticas básicas
    const summary = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions 
      WHERE user_id = ${user.id}
      ${filter !== "all" ? sql`AND type = ${filter}` : sql``}
    `

    const totalIncome = Number(summary[0]?.total_income || 0)
    const totalExpenses = Number(summary[0]?.total_expenses || 0)
    const balance = totalIncome - totalExpenses

    // Produto com mais vendas (maior valor)
    const topProductResult = await sql`
      SELECT description, SUM(amount) as amount
      FROM transactions 
      WHERE user_id = ${user.id}
      ${filter !== "all" ? sql`AND type = ${filter}` : sql``}
      GROUP BY description
      ORDER BY amount DESC
      LIMIT 1
    `

    // Produto com menos vendas (menor valor)
    const bottomProductResult = await sql`
      SELECT description, SUM(amount) as amount
      FROM transactions 
      WHERE user_id = ${user.id}
      ${filter !== "all" ? sql`AND type = ${filter}` : sql``}
      GROUP BY description
      ORDER BY amount ASC
      LIMIT 1
    `

    // Dia de pico de vendas
    const peakDayResult = await sql`
      SELECT date, SUM(amount) as amount
      FROM transactions 
      WHERE user_id = ${user.id}
      ${filter !== "all" ? sql`AND type = ${filter}` : sql``}
      GROUP BY date
      ORDER BY amount DESC
      LIMIT 1
    `

    // Dados diários para gráficos
    const dailyDataResult = await sql`
      SELECT 
        date,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions 
      WHERE user_id = ${user.id}
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `

    // Dados por categoria para gráfico de pizza
    const categoryDataResult = await sql`
      SELECT 
        description,
        SUM(amount) as amount,
        type
      FROM transactions 
      WHERE user_id = ${user.id}
      ${filter !== "all" ? sql`AND type = ${filter}` : sql``}
      GROUP BY description, type
      ORDER BY amount DESC
      LIMIT 10
    `

    return {
      totalIncome,
      totalExpenses,
      balance,
      topProduct: topProductResult[0]
        ? {
            description: topProductResult[0].description,
            amount: Number(topProductResult[0].amount),
          }
        : null,
      bottomProduct: bottomProductResult[0]
        ? {
            description: bottomProductResult[0].description,
            amount: Number(bottomProductResult[0].amount),
          }
        : null,
      peakDay: peakDayResult[0]
        ? {
            date: peakDayResult[0].date,
            amount: Number(peakDayResult[0].amount),
          }
        : null,
      dailyData: dailyDataResult.map((row) => ({
        date: row.date,
        income: Number(row.income),
        expense: Number(row.expense),
      })),
      categoryData: categoryDataResult.map((row) => ({
        description: row.description,
        amount: Number(row.amount),
        type: row.type,
      })),
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      topProduct: null,
      bottomProduct: null,
      peakDay: null,
      dailyData: [],
      categoryData: [],
    }
  }
}
