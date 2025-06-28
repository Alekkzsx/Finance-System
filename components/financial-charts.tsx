"use client"

import { useMemo } from "react"
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

interface ChartData {
  dailyData: Array<{ date: string; income: number; expense: number }>
  categoryData: Array<{ description: string; amount: number; type: string }>
}

interface FinancialChartsProps extends ChartData {
  type: "pie" | "bar" | "line" | "candlestick"
  filter: "all" | "income" | "expense"
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
  "#8DD1E1",
  "#D084D0",
]

export function FinancialCharts({ type, dailyData, categoryData, filter }: FinancialChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const pieData = useMemo(() => {
    return categoryData.map((item, index) => ({
      name: item.description,
      value: item.amount,
      fill: COLORS[index % COLORS.length],
    }))
  }, [categoryData])

  const barData = useMemo(() => {
    return dailyData
      .slice(0, 10)
      .reverse()
      .map((item) => ({
        date: new Date(item.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
        receitas: item.income,
        despesas: item.expense,
        saldo: item.income - item.expense,
      }))
  }, [dailyData])

  const lineData = useMemo(() => {
    return dailyData
      .slice(0, 15)
      .reverse()
      .map((item) => ({
        date: new Date(item.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
        valor: filter === "income" ? item.income : filter === "expense" ? item.expense : item.income - item.expense,
      }))
  }, [dailyData, filter])

  const candlestickData = useMemo(() => {
    // Agrupar dados por semana para candlestick
    const weeklyData: { [key: string]: { income: number; expense: number; count: number } } = {}

    dailyData.forEach((item) => {
      const date = new Date(item.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { income: 0, expense: 0, count: 0 }
      }

      weeklyData[weekKey].income += item.income
      weeklyData[weekKey].expense += item.expense
      weeklyData[weekKey].count++
    })

    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
        open: data.income * 0.9,
        high: Math.max(data.income, data.expense),
        low: Math.min(data.income, data.expense) * 0.8,
        close: data.expense,
        volume: data.count,
      }))
      .slice(0, 8)
  }, [dailyData])

  if (type === "pie") {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "bar") {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
            <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
            <Bar dataKey="saldo" fill="#3B82F6" name="Saldo" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "line") {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#8884d8"
              strokeWidth={2}
              name={filter === "income" ? "Receitas" : filter === "expense" ? "Despesas" : "Saldo"}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "candlestick") {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={candlestickData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Semana: ${label}`}
            />
            <Legend />
            <Bar dataKey="high" fill="#10B981" name="Máximo" />
            <Bar dataKey="low" fill="#EF4444" name="Mínimo" />
            <Bar dataKey="close" fill="#3B82F6" name="Fechamento" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="h-[400px] flex items-center justify-center text-muted-foreground">Selecione um tipo de gráfico</div>
  )
}
