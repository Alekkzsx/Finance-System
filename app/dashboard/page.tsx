import { getDashboardStats } from "@/app/actions/dashboard"
import { DashboardContent } from "@/components/dashboard-content"
import { requireAuth } from "@/lib/auth"

interface DashboardPageProps {
  searchParams: {
    filter?: "all" | "income" | "expense"
    chartType?: "pie" | "bar" | "line" | "candlestick"
    chartData?: string
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuth()

  const filter = searchParams.filter || "all"
  const chartType = searchParams.chartType || "bar"
  const chartData = searchParams.chartData || "revenue_vs_expense"

  const stats = await getDashboardStats(filter, chartData)

  return (
    <div className="container mx-auto p-6">
      <DashboardContent
        user={user}
        stats={stats}
        currentFilter={filter}
        currentChartType={chartType}
        currentChartData={chartData}
      />
    </div>
  )
}
