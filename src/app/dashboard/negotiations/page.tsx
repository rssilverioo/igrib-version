import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  User,
  Clock,
} from "lucide-react"
import { PRODUCT_ICONS } from "@/lib/constants"
import Link from "next/link"

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getNegotiationStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    ABERTA: {
      label: "Aberta",
      className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    },
    FECHADA: {
      label: "Fechada",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    CANCELADA: {
      label: "Cancelada",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
  }
  const info = map[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  }
  return (
    <Badge variant="secondary" className={info.className}>
      {info.label}
    </Badge>
  )
}

function getOtherUser(
  negotiation: {
    user1Id: string
    user1: { id: string; name: string; company: string | null }
    user2: { id: string; name: string; company: string | null }
  },
  currentUserId: string,
) {
  return negotiation.user1Id === currentUserId
    ? negotiation.user2
    : negotiation.user1
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Nenhuma negociação aberta
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Explore o marketplace e inicie negociações para começar.
      </p>
      <Link href="/dashboard/marketplace" className="mt-5">
        <Button
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Explorar Marketplace
        </Button>
      </Link>
    </div>
  )
}

export default async function DashboardNegotiationsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const openNegotiations = await prisma.negotiation.findMany({
    where: {
      OR: [{ user1Id: session.id }, { user2Id: session.id }],
      status: "ABERTA",
    },
    include: { offer: true, user1: true, user2: true },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Negociações</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe suas negociações em andamento
        </p>
      </div>

      {openNegotiations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {openNegotiations.map((neg) => {
            const other = getOtherUser(neg, session.id)
            return (
              <Card
                key={neg.id}
                className="border border-border/50 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                      {PRODUCT_ICONS[neg.offer.product] || "📦"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {neg.offer.product}{" "}
                        <span className="font-normal text-muted-foreground">
                          - {neg.offer.quantity} {neg.offer.unit}
                          {neg.offer.quantity > 1 ? "s" : ""}
                        </span>
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {other.name}
                          {other.company && ` - ${other.company}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(neg.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0">
                    {getNegotiationStatusBadge(neg.status)}
                    <Link href={`/negotiations/${neg.id}`}>
                      <Button
                        size="sm"
                        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Abrir Chat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
