"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"

interface FinancialChartsProps {
  data: any[]
  chartType: "pie" | "bar" | "line" | "candlestick"
  dataType: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export function FinancialCharts({ data, chartType, dataType }: FinancialChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getChartTitle = () => {
    const titles: Record<string, string> = {
      revenue_by_product: "Receita por Produto",
      revenue: "Receitas",
      expense_by_category: "Despesa por Categoria",
      expense: "Despesas",
      revenue_vs_expense: "Receita vs Despesa",
      profit_by_week: "Lucro por Semana",
      profit_by_month: "Lucro por Mês",
    }
    return titles[dataType] || "Dados Financeiros"
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>Nenhum dado disponível para exibir</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>Adicione algumas transações para ver os gráficos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )

      case "candlestick":
        // For candlestick, we'll use a bar chart with different styling
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 {getChartTitle()}
          <span className="text-sm font-normal text-gray-500">
            ({data.length} {data.length === 1 ? "item" : "itens"})
          </span>
        </CardTitle>
        <CardDescription>
          Visualização{" "}
          {chartType === "pie"
            ? "em pizza"
            : chartType === "bar"
              ? "em barras"
              : chartType === "line"
                ? "em linha"
                : "em vela"}{" "}
          dos dados selecionados
        </CardDescription>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
