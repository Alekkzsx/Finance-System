import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface FinancialSummaryProps {
  totalRevenue: number
  totalExpense: number
  netProfit: number
  filter: "all" | "income" | "expense"
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function FinancialSummary({ totalRevenue, totalExpense, netProfit, filter }: FinancialSummaryProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">{filter === "all" ? "Total geral" : "Filtro aplicado"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
          <p className="text-xs text-muted-foreground mt-1">{filter === "all" ? "Total geral" : "Filtro aplicado"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", netProfit >= 0 ? "text-green-600" : "text-red-600")}>
            {formatCurrency(netProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{filter === "all" ? "Total geral" : "Filtro aplicado"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
