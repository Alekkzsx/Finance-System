"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Trash2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { createTransaction, deleteTransaction } from "@/app/actions/transactions"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import type { User, Transaction } from "@/lib/db"

interface DataEntryContentProps {
  user: User
  data: {
    transactions: Transaction[]
    pagination: {
      currentPage: number
      totalPages: number
      total: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  currentFilter: "all" | "income" | "expense"
  currentSearch: string
  currentSortBy: string
  currentSortOrder: "asc" | "desc"
}

export function DataEntryContent({
  user,
  data,
  currentFilter,
  currentSearch,
  currentSortBy,
  currentSortOrder,
}: DataEntryContentProps) {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState(currentSearch)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")
    setSuccess("")

    const result = await createTransaction(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess("Transação adicionada com sucesso!")
      const form = document.getElementById("add-transaction-form") as HTMLFormElement
      form?.reset()
    }

    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      await deleteTransaction(id)
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", page.toString())
    window.location.href = `/data-entry?${params.toString()}`
  }

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("filter", filter)
    params.delete("page") // Reset to first page
    window.location.href = `/data-entry?${params.toString()}`
  }

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search)
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    params.delete("page") // Reset to first page
    window.location.href = `/data-entry?${params.toString()}`
  }

  const handleSort = (column: string) => {
    const params = new URLSearchParams(window.location.search)

    if (currentSortBy === column) {
      // Toggle order if same column
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc")
    } else {
      // New column, default to asc
      params.set("sortBy", column)
      params.set("sortOrder", "asc")
    }

    params.delete("page") // Reset to first page
    window.location.href = `/data-entry?${params.toString()}`
  }

  const getSortIcon = (column: string) => {
    if (currentSortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    return currentSortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case "income":
        return "Apenas Receitas"
      case "expense":
        return "Apenas Despesas"
      default:
        return "Todas as Transações"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🧾 Cadastro de Dados</h1>
        <p className="text-muted-foreground">
          Adicione e gerencie suas receitas e despesas - {getFilterLabel(currentFilter)}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulário de adição */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Adicionar Transação</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="add-transaction-form" action={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customId">ID Personalizado (opcional)</Label>
                <Input id="customId" name="customId" type="text" placeholder="Ex: R001, D001" disabled={isLoading} />
                <p className="text-xs text-muted-foreground">Se não informado, será gerado automaticamente</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Ex: Salário, Aluguel, Compras..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  disabled={isLoading}
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Adicionando..." : "Adicionar Transação"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de transações com filtros e busca */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transações Cadastradas</CardTitle>

            {/* Filtros e busca */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2 flex-1">
                <div className="flex-1">
                  <Input
                    placeholder="🔍 Buscar por descrição, ID, valor ou data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} variant="outline" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Select value={currentFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Transações</SelectItem>
                  <SelectItem value="income">Apenas Receitas</SelectItem>
                  <SelectItem value="expense">Apenas Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Informações de paginação */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <p>
                Total: {data.pagination.total} registros
                {currentSearch && ` (filtrados por "${currentSearch}")`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                  disabled={!data.pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {data.pagination.currentPage} de {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                  disabled={!data.pagination.hasNext}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {data.transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação encontrada.</p>
                <p className="text-sm">
                  {currentSearch || currentFilter !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "Adicione sua primeira receita ou despesa!"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("custom_id")}
                      >
                        <div className="flex items-center gap-2">
                          ID Pareado
                          {getSortIcon("custom_id")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-2">
                          Data
                          {getSortIcon("date")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("description")}
                      >
                        <div className="flex items-center gap-2">
                          Descrição
                          {getSortIcon("description")}
                        </div>
                      </TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Valor
                          {getSortIcon("amount")}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-semibold">
                          <Badge variant="outline" className="font-mono">
                            {transaction.custom_id}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">{transaction.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.type === "income" ? "default" : "destructive"}
                            className="flex items-center gap-1 w-fit"
                          >
                            {transaction.type === "income" ? (
                              <Plus className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            {transaction.type === "income" ? "Receita" : "Despesa"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingTransaction(transaction)}
                              title="Editar transação"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(transaction.id)}
                              title="Excluir transação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}
    </div>
  )
}
