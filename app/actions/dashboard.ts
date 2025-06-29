"use server"

import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import type { DashboardStats } from "@/lib/db"

export async function getDashboardStats(
  filter: "all" | "income" | "expense" = "all",
  chartDataType:
    | "revenue_by_product"
    | "revenue"
    | "expense_by_category"
    | "expense"
    | "revenue_vs_expense"
    | "profit_by_week"
    | "profit_by_month" = "revenue_vs_expense",
): Promise<DashboardStats & { chartDataType: string; chartData: any[] }> {
  const user = await requireAuth()

  try {
    // Estatísticas básicas com filtro aplicado
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions 
      WHERE user_id = $1
      ${filter !== "all" ? `AND type = '${filter}'` : ""}
    `

    const summary = await sql(summaryQuery, [user.id])

    const totalIncome = Number(summary[0]?.total_income || 0)
    const totalExpenses = Number(summary[0]?.total_expenses || 0)
    const balance = totalIncome - totalExpenses

    // Produto com mais vendas (baseado no filtro)
    const topProductQuery = `
      SELECT description, SUM(amount) as amount, type
      FROM transactions 
      WHERE user_id = $1
      ${filter !== "all" ? `AND type = '${filter}'` : ""}
      GROUP BY description, type
      ORDER BY amount DESC
      LIMIT 1
    `

    const topProductResult = await sql(topProductQuery, [user.id])

    // Produto com menos vendas
    const bottomProductQuery = `
      SELECT description, SUM(amount) as amount, type
      FROM transactions 
      WHERE user_id = $1
      ${filter !== "all" ? `AND type = '${filter}'` : ""}
      GROUP BY description, type
      ORDER BY amount ASC
      LIMIT 1
    `

    const bottomProductResult = await sql(bottomProductQuery, [user.id])

    // Dia de pico de vendas
    const peakDayQuery = `
      SELECT date, SUM(amount) as amount
      FROM transactions 
      WHERE user_id = $1
      ${filter !== "all" ? `AND type = '${filter}'` : ""}
      GROUP BY date
      ORDER BY amount DESC
      LIMIT 1
    `

    const peakDayResult = await sql(peakDayQuery, [user.id])

    // Dados para gráficos baseados no tipo selecionado
    let chartData = []

    switch (chartDataType) {
      case "revenue_by_product":
        chartData = await sql(
          `
          SELECT 
            description,
            SUM(amount) as amount,
            'income' as type
          FROM transactions 
          WHERE user_id = $1 AND type = 'income'
          GROUP BY description
          ORDER BY amount DESC
          LIMIT 10
        `,
          [user.id],
        )
        break

      case "expense_by_category":
        chartData = await sql(
          `
          SELECT 
            description,
            SUM(amount) as amount,
            'expense' as type
          FROM transactions 
          WHERE user_id = $1 AND type = 'expense'
          GROUP BY description
          ORDER BY amount DESC
          LIMIT 10
        `,
          [user.id],
        )
        break

      case "profit_by_week":
        chartData = await sql(
          `
          SELECT 
            DATE_TRUNC('week', date::date) as period,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as profit
          FROM transactions 
          WHERE user_id = $1
          GROUP BY DATE_TRUNC('week', date::date)
          ORDER BY period DESC
          LIMIT 12
        `,
          [user.id],
        )
        break

      case "profit_by_month":
        chartData = await sql(
          `
          SELECT 
            DATE_TRUNC('month', date::date) as period,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as profit
          FROM transactions 
          WHERE user_id = $1
          GROUP BY DATE_TRUNC('month', date::date)
          ORDER BY period DESC
          LIMIT 12
        `,
          [user.id],
        )
        break

      case "revenue":
        chartData = await sql(
          `
          SELECT 
            date,
            SUM(amount) as amount,
            'income' as type
          FROM transactions 
          WHERE user_id = $1 AND type = 'income'
          GROUP BY date
          ORDER BY date DESC
          LIMIT 30
        `,
          [user.id],
        )
        break

      case "expense":
        chartData = await sql(
          `
          SELECT 
            date,
            SUM(amount) as amount,
            'expense' as type
          FROM transactions 
          WHERE user_id = $1 AND type = 'expense'
          GROUP BY date
          ORDER BY date DESC
          LIMIT 30
        `,
          [user.id],
        )
        break

      default: // revenue_vs_expense
        chartData = await sql(
          `
          SELECT 
            date,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
          FROM transactions 
          WHERE user_id = $1
          GROUP BY date
          ORDER BY date DESC
          LIMIT 30
        `,
          [user.id],
        )
    }

    // Dados diários para gráficos (sempre necessário)
    const dailyDataResult = await sql(
      `
      SELECT 
        date,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions 
      WHERE user_id = $1
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `,
      [user.id],
    )

    // Dados por categoria para gráfico de pizza
    const categoryDataQuery = `
      SELECT 
        description,
        SUM(amount) as amount,
        type
      FROM transactions 
      WHERE user_id = $1
      ${filter !== "all" ? `AND type = '${filter}'` : ""}
      GROUP BY description, type
      ORDER BY amount DESC
      LIMIT 10
    `

    const categoryDataResult = await sql(categoryDataQuery, [user.id])

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
      chartData: chartData.map((row) => ({
        ...row,
        amount: Number(row.amount || 0),
        income: Number(row.income || 0),
        expense: Number(row.expense || 0),
        profit: Number(row.profit || 0),
        period: row.period,
        date: row.date,
        description: row.description,
        type: row.type,
      })),
      chartDataType,
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
      chartData: [],
      chartDataType,
    }
  }
}
