import { neon } from "@neondatabase/serverless"

/**
 * Carrega a URL de conexão de forma flexível:
 * - Primeiro tenta DATABASE_URL (usado localmente)
 * - Depois POSTGRES_URL (Vercel/Postgres)
 * - Depois POSTGRES_URL_NON_POOLING (caso sem pool)
 */
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL (ou POSTGRES_URL) não encontrada. Verifique as variáveis de ambiente.")
}

/**
 * Mantém uma única instância de conexão (singleton) para evitar
 * múltiplas criações em ambiente serverless.
 */
let _sql: ReturnType<typeof neon> | null = null
export const sql = (...args: Parameters<ReturnType<typeof neon>>) => {
  if (!_sql) {
    _sql = neon(DATABASE_URL)
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – Neon aceita o spread de Arguments
  return _sql(...args)
}

/** Tipagens já existentes permanecem abaixo (inalteradas) */
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
