import { requireAuth } from "@/lib/auth"
import { getTransactionsPaginated } from "@/app/actions/transactions"
import { DataEntryContent } from "@/components/data-entry-content"

interface DataEntryPageProps {
  searchParams: { page?: string }
}

export default async function DataEntryPage({ searchParams }: DataEntryPageProps) {
  const user = await requireAuth()
  const page = Number(searchParams.page) || 1
  const data = await getTransactionsPaginated(page, 20)

  return <DataEntryContent user={user} data={data} />
}
