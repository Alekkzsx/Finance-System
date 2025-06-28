import { requireAuth } from "@/lib/auth"
import { getDashboardStats } from "@/app/actions/dashboard"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardContent } from "@/components/dashboard-content"

interface DashboardPageProps {
  searchParams: { filter?: "all" | "income" | "expense" }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuth()
  const filter = searchParams.filter || "all"
  const stats = await getDashboardStats(filter)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <DashboardContent user={user} stats={stats} currentFilter={filter} />
      </main>
    </div>
  )
}
