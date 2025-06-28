"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Award, AlertTriangle } from "lucide-react"
import { FinancialCharts } from "./financial-charts"
import type { User, DashboardStats } from "@/lib/db"

interface DashboardContentProps {
  user: User
  stats: DashboardStats
  currentFilter: "all" | "income" | "expense"
}

export function DashboardContent({ user, stats, currentFilter }: DashboardContentProps) {
  const [chartType, setChartType] = useState<"pie" | "bar" | "line" | "candlestick">("bar")

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
    window.location.href = `/dashboard?filter=${filter}`
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={currentFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dados</SelectItem>
              <SelectItem value="income">Apenas receitas</SelectItem>
              <SelectItem value="expense">Apenas despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
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
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas detalhadas */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Produto Mais Vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topProduct ? (
              <div>
                <p className="font-semibold">{stats.topProduct.description}</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.topProduct.amount)}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Produto Menos Vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bottomProduct ? (
              <div>
                <p className="font-semibold">{stats.bottomProduct.description}</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.bottomProduct.amount)}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Dia de Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.peakDay ? (
              <div>
                <p className="font-semibold">{formatDate(stats.peakDay.date)}</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.peakDay.amount)}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Financeira</CardTitle>
          <CardDescription>
            Visualização dos dados em formato{" "}
            {chartType === "pie" ? "pizza" : chartType === "bar" ? "barras" : chartType === "line" ? "linha" : "vela"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialCharts
            type={chartType}
            dailyData={stats.dailyData}
            categoryData={stats.categoryData}
            filter={currentFilter}
          />
        </CardContent>
      </Card>
    </div>
  )
}
