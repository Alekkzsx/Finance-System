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
  Area,
  AreaChart,
} from "recharts"

interface ChartData {
  dailyData: Array<{ date: string; income: number; expense: number }>
  categoryData: Array<{ description: string; amount: number; type: string }>
  chartData?: any[]
}

interface FinancialChartsProps extends ChartData {
  type: "pie" | "bar" | "line" | "candlestick"
  chartDataType: string
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
  "#FFBB33",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
]

export function FinancialCharts({
  type,
  dailyData,
  categoryData,
  chartData = [],
  chartDataType,
  filter,
}: FinancialChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  // Preparar dados baseados no tipo de gráfico e dados selecionados
  const processedData = useMemo(() => {
    console.log("Chart Data Type:", chartDataType)
    console.log("Chart Data:", chartData)
    console.log("Daily Data:", dailyData)
    console.log("Category Data:", categoryData)

    if (chartDataType === "revenue_by_product" || chartDataType === "expense_by_category") {
      return chartData.map((item, index) => ({
        name: item.description || "Sem descrição",
        value: Number(item.amount) || 0,
        fill: COLORS[index % COLORS.length],
      }))
    }

    if (chartDataType === "profit_by_week" || chartDataType === "profit_by_month") {
      return chartData
        .map((item) => ({
          period: formatDate(item.period),
          receitas: Number(item.income) || 0,
          despesas: Number(item.expense) || 0,
          lucro: Number(item.profit) || 0,
        }))
        .reverse()
    }

    if (chartDataType === "revenue" || chartDataType === "expense") {
      return chartData
        .map((item) => ({
          date: formatDate(item.date),
          valor: Number(item.amount) || 0,
        }))
        .reverse()
        .slice(0, 15)
    }

    // Default: revenue_vs_expense usando dailyData
    return dailyData
      .slice(0, 15)
      .reverse()
      .map((item) => ({
        date: formatDate(item.date),
        receitas: Number(item.income) || 0,
        despesas: Number(item.expense) || 0,
        saldo: Number(item.income) - Number(item.expense),
        valor:
          filter === "income"
            ? Number(item.income)
            : filter === "expense"
              ? Number(item.expense)
              : Number(item.income) - Number(item.expense),
      }))
  }, [chartData, chartDataType, dailyData, filter])

  // Dados para gráfico de pizza
  const pieData = useMemo(() => {
    if (chartDataType === "revenue_by_product" || chartDataType === "expense_by_category") {
      return processedData
    }

    return categoryData.map((item, index) => ({
      name: item.description,
      value: Number(item.amount) || 0,
      fill: COLORS[index % COLORS.length],
    }))
  }, [categoryData, processedData, chartDataType])

  const candlestickData = useMemo(() => {
    const weeklyData: { [key: string]: { income: number; expense: number; count: number } } = {}

    dailyData.forEach((item) => {
      const date = new Date(item.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { income: 0, expense: 0, count: 0 }
      }

      weeklyData[weekKey].income += Number(item.income) || 0
      weeklyData[weekKey].expense += Number(item.expense) || 0
      weeklyData[weekKey].count++
    })

    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week: formatDate(week),
        abertura: data.income * 0.9,
        maximo: Math.max(data.income, data.expense),
        minimo: Math.min(data.income, data.expense) * 0.8,
        fechamento: data.expense,
        volume: data.count,
      }))
      .slice(0, 8)
  }, [dailyData])

  // Verificar se há dados para exibir
  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">📊 Nenhum dado disponível</p>
          <p className="text-sm mt-2">Adicione algumas transações para ver os gráficos</p>
          <p className="text-xs mt-1">
            Tipo: {chartDataType} | Filtro: {filter}
          </p>
        </div>
      </div>
    )
  }

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
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={
                chartDataType.includes("profit_by")
                  ? "period"
                  : chartDataType === "revenue" || chartDataType === "expense"
                    ? "date"
                    : "date"
              }
              tick={{ fontSize: 12 }}
            />
            <YAxis tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />

            {chartDataType.includes("profit_by") ? (
              <>
                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                <Bar dataKey="lucro" fill="#3B82F6" name="Lucro" />
              </>
            ) : chartDataType === "revenue" || chartDataType === "expense" ? (
              <Bar
                dataKey="valor"
                fill={chartDataType === "revenue" ? "#10B981" : "#EF4444"}
                name={chartDataType === "revenue" ? "Receitas" : "Despesas"}
              />
            ) : (
              <>
                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                <Bar dataKey="saldo" fill="#3B82F6" name="Saldo" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "line") {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={
                chartDataType.includes("profit_by")
                  ? "period"
                  : chartDataType === "revenue" || chartDataType === "expense"
                    ? "date"
                    : "date"
              }
              tick={{ fontSize: 12 }}
            />
            <YAxis tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />

            {chartDataType.includes("profit_by") ? (
              <>
                <Line type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={2} name="Receitas" />
                <Line type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={2} name="Despesas" />
                <Line type="monotone" dataKey="lucro" stroke="#3B82F6" strokeWidth={3} name="Lucro" />
              </>
            ) : chartDataType === "revenue" || chartDataType === "expense" ? (
              <Line
                type="monotone"
                dataKey="valor"
                stroke={chartDataType === "revenue" ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                name={chartDataType === "revenue" ? "Receitas" : "Despesas"}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#8884d8"
                strokeWidth={2}
                name={filter === "income" ? "Receitas" : filter === "expense" ? "Despesas" : "Saldo"}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "candlestick") {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={candlestickData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Semana: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="maximo"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Máximo"
            />
            <Area
              type="monotone"
              dataKey="minimo"
              stackId="2"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.6}
              name="Mínimo"
            />
            <Area
              type="monotone"
              dataKey="fechamento"
              stackId="3"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.8}
              name="Fechamento"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <p>Selecione um tipo de gráfico</p>
        <p className="text-sm mt-2">Dados disponíveis: {processedData.length} registros</p>
      </div>
    </div>
  )
}
