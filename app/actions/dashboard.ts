"use server"

import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export interface DashboardStats {
  totalRevenue: number
  totalExpense: number
  netProfit: number
  topProduct: string
  peakDay: string
  chartData: any[]
  transactionCount: number
}

export async function getDashboardStats(
  filter: "all" | "income" | "expense" = "all",
  chartDataType = "revenue_vs_expense",
): Promise<DashboardStats> {
  // Require authentication first
  const user = await requireAuth()

  try {
    // Base query with user isolation
    let whereClause = "WHERE user_id = $1"
    const params = [user.id]

    // Apply filter
    if (filter === "income") {
      whereClause += " AND type = 'income'"
    } else if (filter === "expense") {
      whereClause += " AND type = 'expense'"
    }

    // Get basic stats
    const statsQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as transaction_count
      FROM transactions 
      ${whereClause}
    `

    const statsResult = await sql(statsQuery, params)
    const stats = statsResult[0] || { total_revenue: 0, total_expense: 0, transaction_count: 0 }

    // Get top product (most frequent in income transactions)
    const topProductQuery = `
      SELECT description, COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 AND type = 'income' AND description IS NOT NULL AND description != ''
      GROUP BY description 
      ORDER BY count DESC 
      LIMIT 1
    `
    const topProductResult = await sql(topProductQuery, [user.id])
    const topProduct = topProductResult[0]?.description || "Nenhum produto"

    // Get peak day (day with most transactions)
    const peakDayQuery = `
      SELECT DATE(created_at) as day, COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1
      GROUP BY DATE(created_at) 
      ORDER BY count DESC 
      LIMIT 1
    `
    const peakDayResult = await sql(peakDayQuery, [user.id])
    const peakDay = peakDayResult[0]?.day ? new Date(peakDayResult[0].day).toLocaleDateString("pt-BR") : "Nenhum dia"

    // Get chart data based on type
    let chartData = []

    switch (chartDataType) {
      case "revenue_by_product":
        const revenueByProductQuery = `
          SELECT description as name, SUM(amount) as value
          FROM transactions 
          WHERE user_id = $1 AND type = 'income' AND description IS NOT NULL
          GROUP BY description 
          ORDER BY value DESC 
          LIMIT 10
        `
        chartData = await sql(revenueByProductQuery, [user.id])
        break

      case "expense_by_category":
        const expenseByCategoryQuery = `
          SELECT description as name, SUM(amount) as value
          FROM transactions 
          WHERE user_id = $1 AND type = 'expense' AND description IS NOT NULL
          GROUP BY description 
          ORDER BY value DESC 
          LIMIT 10
        `
        chartData = await sql(expenseByCategoryQuery, [user.id])
        break

      case "revenue_vs_expense":
        const revenueVsExpenseQuery = `
          SELECT 
            'Receitas' as name, 
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as value
          FROM transactions WHERE user_id = $1
          UNION ALL
          SELECT 
            'Despesas' as name, 
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as value
          FROM transactions WHERE user_id = $1
        `
        chartData = await sql(revenueVsExpenseQuery, [user.id])
        break

      case "profit_by_week":
        const profitByWeekQuery = `
          SELECT 
            DATE_TRUNC('week', created_at) as period,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as value
          FROM transactions 
          WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '8 weeks'
          GROUP BY DATE_TRUNC('week', created_at)
          ORDER BY period
        `
        const weekData = await sql(profitByWeekQuery, [user.id])
        chartData = weekData.map((row: any) => ({
          name: new Date(row.period).toLocaleDateString("pt-BR"),
          value: Number.parseFloat(row.value),
        }))
        break

      case "profit_by_month":
        const profitByMonthQuery = `
          SELECT 
            DATE_TRUNC('month', created_at) as period,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as value
          FROM transactions 
          WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY period
        `
        const monthData = await sql(profitByMonthQuery, [user.id])
        chartData = monthData.map((row: any) => ({
          name: new Date(row.period).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
          value: Number.parseFloat(row.value),
        }))
        break

      default:
        chartData = []
    }

    return {
      totalRevenue: Number.parseFloat(stats.total_revenue) || 0,
      totalExpense: Number.parseFloat(stats.total_expense) || 0,
      netProfit: (Number.parseFloat(stats.total_revenue) || 0) - (Number.parseFloat(stats.total_expense) || 0),
      topProduct,
      peakDay,
      chartData: chartData || [],
      transactionCount: Number.parseInt(stats.transaction_count) || 0,
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error)
    // Return safe default values
    return {
      totalRevenue: 0,
      totalExpense: 0,
      netProfit: 0,
      topProduct: "Erro ao carregar",
      peakDay: "Erro ao carregar",
      chartData: [],
      transactionCount: 0,
    }
  }
}
