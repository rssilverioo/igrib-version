import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import DashboardSidebar from "@/components/dashboard-sidebar"

export const metadata = {
  title: "Dashboard - IGRIB",
  description: "Gerencie suas ofertas, negociações e contratos no IGRIB.",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={session} />
      <div className="lg:pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
