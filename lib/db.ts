import { neon } from "@neondatabase/serverless"

// Get database URL from environment variables
function getDatabaseUrl() {
  const urls = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.NEON_DATABASE_URL,
  ]

  for (const url of urls) {
    if (url && url.trim()) {
      return url.trim()
    }
  }

  throw new Error("No database URL found in environment variables")
}

// Create singleton connection
let sqlInstance: ReturnType<typeof neon> | null = null

export function sql(query: TemplateStringsArray | string, ...params: any[]) {
  if (!sqlInstance) {
    const databaseUrl = getDatabaseUrl()
    sqlInstance = neon(databaseUrl)
  }

  if (typeof query === "string") {
    return sqlInstance(query, params)
  }

  return sqlInstance(query, ...params)
}

// Types
export interface User {
  id: number
  email: string
  name: string
  created_at: Date
}

export interface Transaction {
  id: number
  user_id: number
  custom_id: string
  type: "income" | "expense"
  amount: number
  description: string
  created_at: Date
}
