"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FinancialCharts } from "@/components/financial-charts"
import { FinancialSummary } from "@/components/financial-summary"
import { DollarSign, TrendingUp, TrendingDown, Package, Calendar } from "lucide-react"
import type { User } from "@/lib/db"
import type { DashboardStats } from "@/app/actions/dashboard"

interface DashboardContentProps {
  user: User
  stats: DashboardStats
  currentFilter: "all" | "income" | "expense"
  currentChartType: "pie" | "bar" | "line" | "candlestick"
  currentChartData: string
}

export function DashboardContent({
  user,
  stats,
  currentFilter,
  currentChartType,
  currentChartData,
}: DashboardContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("filter", filter)
    router.push(`/dashboard?${params.toString()}`)
  }

  const updateChartType = (chartType: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("chartType", chartType)
    router.push(`/dashboard?${params.toString()}`)
  }

  const updateChartData = (chartData: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("chartData", chartData)
    router.push(`/dashboard?${params.toString()}`)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const chartDataOptions = [
    { value: "revenue_by_product", label: "📦 Receita por Produto" },
    { value: "revenue", label: "💰 Receitas" },
    { value: "expense_by_category", label: "📊 Despesa por Categoria" },
    { value: "expense", label: "💸 Despesas" },
    { value: "revenue_vs_expense", label: "⚖️ Receita vs Despesa" },
    { value: "profit_by_week", label: "📅 Lucro por Semana" },
    { value: "profit_by_month", label: "📆 Lucro por Mês" },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Olá, {user.name}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">Aqui está o resumo das suas finanças</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("all")}
          >
            📊 Tudo
          </Button>
          <Button
            variant={currentFilter === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("income")}
          >
            💰 Receitas
          </Button>
          <Button
            variant={currentFilter === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("expense")}
          >
            💸 Despesas
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
            <TrendingDown className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpense)}</div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r ${stats.netProfit >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"} text-white`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.netProfit)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produto Top</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats.topProduct}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dia de Pico</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats.peakDay}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Gráficos Dinâmicos
            <Badge variant="secondary">{stats.transactionCount} transações</Badge>
          </CardTitle>
          <CardDescription>Personalize a visualização dos seus dados financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Tipo de Gráfico</label>
              <Select value={currentChartType} onValueChange={updateChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">📊 Barras</SelectItem>
                  <SelectItem value="pie">🥧 Pizza</SelectItem>
                  <SelectItem value="line">📈 Linha</SelectItem>
                  <SelectItem value="candlestick">🕯️ Vela</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Dados para Exibir</label>
              <Select value={currentChartData} onValueChange={updateChartData}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartDataOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <FinancialCharts data={stats.chartData} chartType={currentChartType} dataType={currentChartData} />
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <FinancialSummary
        totalRevenue={stats.totalRevenue}
        totalExpense={stats.totalExpense}
        netProfit={stats.netProfit}
        filter={currentFilter}
      />
    </div>
  )
}
