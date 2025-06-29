import { requireAuth } from "@/lib/auth"
import { getTransactionsPaginated } from "@/app/actions/transactions"
import { DataEntryContent } from "@/components/data-entry-content"

interface DataEntryPageProps {
  searchParams: {
    page?: string
    filter?: "all" | "income" | "expense"
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }
}

export default async function DataEntryPage({ searchParams }: DataEntryPageProps) {
  const user = await requireAuth()
  const page = Number(searchParams.page) || 1
  const rawFilter = searchParams.filter || "all"
  const filter: "all" | "income" | "expense" = rawFilter === "income" || rawFilter === "expense" ? rawFilter : "all"
  const search = searchParams.search || ""
  const sortBy = searchParams.sortBy || "custom_id"
  const sortOrder = searchParams.sortOrder || "asc"

  const data = await getTransactionsPaginated(page, 20, filter, search, sortBy, sortOrder as "asc" | "desc")

  return (
    <DataEntryContent
      user={user}
      data={data}
      currentFilter={filter}
      currentSearch={search}
      currentSortBy={sortBy}
      currentSortOrder={sortOrder as "asc" | "desc"}
    />
  )
}
