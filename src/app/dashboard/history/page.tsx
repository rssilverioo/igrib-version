import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  ShoppingCart,
  User,
  CalendarDays,
  FileText,
  ExternalLink,
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

function getContractStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    GERADO: {
      label: "Gerado",
      className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    },
    ASSINADO: {
      label: "Assinado",
      className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
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

export default async function DashboardHistoryPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const isProdutor = session.role === "PRODUTOR"

  const closedDeals = await prisma.negotiation.findMany({
    where: {
      OR: [{ user1Id: session.id }, { user2Id: session.id }],
      status: "FECHADA",
    },
    include: { offer: true, user1: true, user2: true, contract: true },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isProdutor ? "Negócios Fechados" : "Histórico de Compras"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isProdutor
            ? "Histórico de negócios concluídos com contratos gerados"
            : "Suas compras concluídas e contratos gerados"}
        </p>
      </div>

      {closedDeals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            {isProdutor ? (
              <CheckCircle className="h-8 w-8 text-muted-foreground/60" />
            ) : (
              <ShoppingCart className="h-8 w-8 text-muted-foreground/60" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {isProdutor ? "Nenhum negócio fechado" : "Nenhuma compra realizada"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Quando uma negociação for concluída com proposta aceita, o registro aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {closedDeals.map((deal) => {
            const other = getOtherUser(deal, session.id)
            return (
              <Card
                key={deal.id}
                className="border border-border/50 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg">
                      {PRODUCT_ICONS[deal.offer.product] || "📦"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {deal.offer.product}{" "}
                        <span className="font-normal text-muted-foreground">
                          - {deal.offer.quantity} {deal.offer.unit}
                          {deal.offer.quantity > 1 ? "s" : ""}
                        </span>
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {other.name}
                          {other.company && ` - ${other.company}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(deal.updatedAt)}
                        </span>
                        {deal.contract && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Contrato{" "}
                            {getContractStatusBadge(deal.contract.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0">
                    {getNegotiationStatusBadge(deal.status)}
                    {deal.contract ? (
                      <Link href={`/contracts/${deal.contract.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Ver Contrato
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/negotiations/${deal.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Detalhes
                        </Button>
                      </Link>
                    )}
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
