"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Award, Filter } from "lucide-react"
import { FinancialCharts } from "./financial-charts"
import type { User, DashboardStats } from "@/lib/db"

interface DashboardContentProps {
  user: User
  stats: DashboardStats & { chartData: any[]; chartDataType: string }
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
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("filter", filter)
    window.location.href = `/dashboard?${params.toString()}`
  }

  const handleChartTypeChange = (type: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("chartType", type)
    window.location.href = `/dashboard?${params.toString()}`
  }

  const handleChartDataChange = (dataType: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("chartData", dataType)
    window.location.href = `/dashboard?${params.toString()}`
  }

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case "income":
        return "Receitas"
      case "expense":
        return "Despesas"
      default:
        return "Todos os dados"
    }
  }

  const getChartDataLabel = (dataType: string) => {
    switch (dataType) {
      case "revenue_by_product":
        return "Receita por Produto"
      case "revenue":
        return "Receitas"
      case "expense_by_category":
        return "Despesa por Categoria"
      case "expense":
        return "Despesas"
      case "revenue_vs_expense":
        return "Receita vs Despesa"
      case "profit_by_week":
        return "Lucro por Semana"
      case "profit_by_month":
        return "Lucro por Mês"
      default:
        return "Receita vs Despesa"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros inteligentes */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">📊 Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças - {getFilterLabel(currentFilter)}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={currentFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ver Tudo</SelectItem>
              <SelectItem value="income">Ver Apenas Receitas</SelectItem>
              <SelectItem value="expense">Ver Apenas Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentChartType} onValueChange={handleChartTypeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Gráfico Pizza</SelectItem>
              <SelectItem value="bar">Gráfico Barras</SelectItem>
              <SelectItem value="line">Gráfico Linha</SelectItem>
              <SelectItem value="candlestick">Gráfico Vela</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentChartData} onValueChange={handleChartDataChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue_by_product">Receita por Produto</SelectItem>
              <SelectItem value="revenue">Receitas</SelectItem>
              <SelectItem value="expense_by_category">Despesa por Categoria</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
              <SelectItem value="revenue_vs_expense">Receita vs Despesa</SelectItem>
              <SelectItem value="profit_by_week">Lucro por Semana</SelectItem>
              <SelectItem value="profit_by_month">Lucro por Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de resumo atualizados */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(stats.totalIncome)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {currentFilter === "all" ? "Total geral" : "Filtro aplicado"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Despesa Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {currentFilter === "all" ? "Total geral" : "Filtro aplicado"}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r ${
            stats.balance >= 0
              ? "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
              : "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className={`text-sm font-medium ${
                stats.balance >= 0 ? "text-blue-800 dark:text-blue-200" : "text-orange-800 dark:text-orange-200"
              }`}
            >
              Lucro Líquido
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${stats.balance >= 0 ? "text-blue-600" : "text-orange-600"}`} />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.balance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"
              }`}
            >
              {formatCurrency(stats.balance)}
            </div>
            <p
              className={`text-xs mt-1 ${
                stats.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
              }`}
            >
              {stats.balance >= 0 ? "Lucro positivo" : "Prejuízo"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Produto Mais Vendido
            </CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {stats.topProduct ? (
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 truncate">
                  {stats.topProduct.description}
                </p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  {formatCurrency(stats.topProduct.amount)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Nenhum dado</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Dia com Mais Vendas
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {stats.peakDay ? (
              <div>
                <p className="font-semibold text-purple-800 dark:text-purple-200">{formatDate(stats.peakDay.date)}</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {formatCurrency(stats.peakDay.amount)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-purple-600 dark:text-purple-400">Nenhum dado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos dinâmicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📈 Análise Financeira Dinâmica</CardTitle>
          <CardDescription>
            Visualização: {getChartDataLabel(currentChartData)} em formato{" "}
            {currentChartType === "pie"
              ? "pizza"
              : currentChartType === "bar"
                ? "barras"
                : currentChartType === "line"
                  ? "linha"
                  : "vela"}
            {currentFilter !== "all" && ` (${getFilterLabel(currentFilter)})`}
          </CardDescription>
          <div className="text-sm text-muted-foreground">
            Dados disponíveis: {stats.chartData?.length || 0} registros
          </div>
        </CardHeader>
        <CardContent>
          <FinancialCharts
            type={currentChartType}
            dailyData={stats.dailyData}
            categoryData={stats.categoryData}
            chartData={stats.chartData}
            chartDataType={currentChartData}
            filter={currentFilter}
          />
        </CardContent>
      </Card>
    </div>
  )
}
