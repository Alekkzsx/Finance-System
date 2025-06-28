import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

export interface User {
  id: number
  email: string
  name: string
  created_at: string
}

export interface Transaction {
  id: number
  user_id: number
  custom_id: string
  type: "income" | "expense"
  description: string
  amount: number
  date: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  balance: number
  topProduct: { description: string; amount: number } | null
  bottomProduct: { description: string; amount: number } | null
  peakDay: { date: string; amount: number } | null
  dailyData: Array<{ date: string; income: number; expense: number }>
  categoryData: Array<{ description: string; amount: number; type: string }>
}
