import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  Plus,
  MapPin,
  Truck,
  CalendarDays,
  Eye,
  Pencil,
  Bookmark,
  BookmarkX,
  User,
  Sprout,
} from "lucide-react"
import { PRODUCT_ICONS } from "@/lib/constants"
import Link from "next/link"

function formatPrice(price: number | null) {
  if (price === null || price === undefined) return "A combinar"
  return `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
}

function formatDateShort(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    ATIVA: {
      label: "Ativa",
      className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    },
    PAUSADA: {
      label: "Pausada",
      className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    },
    VENDIDA: {
      label: "Vendida",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
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

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <Icon className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-5">
          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  )
}

async function ProdutorOffers({ sessionId }: { sessionId: string }) {
  const myOffers = await prisma.offer.findMany({
    where: { userId: sessionId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Ofertas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as suas ofertas publicadas
          </p>
        </div>
        <Link href="/offers/create">
          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Oferta</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </Link>
      </div>

      {myOffers.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhuma oferta publicada"
          description="Publique sua primeira oferta para começar a receber contatos de compradores interessados."
          actionLabel="Criar Oferta"
          actionHref="/offers/create"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {myOffers.map((offer) => (
            <Card
              key={offer.id}
              className="group border border-border/50 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {PRODUCT_ICONS[offer.product] || "📦"}
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        {offer.product}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {offer.quantity} {offer.unit}
                        {offer.quantity > 1 && offer.unit === "tonelada"
                          ? "s"
                          : offer.unit === "saca"
                            ? "s"
                            : ""}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="text-xl font-bold text-primary">
                  {formatPrice(offer.price)}
                  {offer.price && (
                    <span className="text-xs font-normal text-muted-foreground">
                      /{offer.unit}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {offer.city}/{offer.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    {offer.deliveryType}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDateShort(offer.createdAt)}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <Link href={`/offers/${offer.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/offers/${offer.id}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

async function CompradorOffers({ sessionId }: { sessionId: string }) {
  const savedOffers = await prisma.savedOffer.findMany({
    where: { userId: sessionId },
    include: { offer: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ofertas Salvas</h1>
          <p className="text-sm text-muted-foreground">
            Ofertas que você salvou para acompanhar
          </p>
        </div>
        <Link href="/dashboard/marketplace">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Sprout className="h-4 w-4" />
            <span className="hidden sm:inline">Ver Marketplace</span>
            <span className="sm:hidden">Marketplace</span>
          </Button>
        </Link>
      </div>

      {savedOffers.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nenhuma oferta salva"
          description="Explore o marketplace e salve ofertas interessantes para acompanhar e negociar depois."
          actionLabel="Explorar Marketplace"
          actionHref="/dashboard/marketplace"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {savedOffers.map((saved) => {
            const offer = saved.offer
            return (
              <Card
                key={saved.id}
                className="group border border-border/50 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {PRODUCT_ICONS[offer.product] || "📦"}
                      </span>
                      <div>
                        <CardTitle className="text-base">
                          {offer.product}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {offer.quantity} {offer.unit}
                          {offer.quantity > 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(offer.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="text-xl font-bold text-primary">
                    {formatPrice(offer.price)}
                    {offer.price && (
                      <span className="text-xs font-normal text-muted-foreground">
                        /{offer.unit}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {offer.user.name}
                      {offer.user.company && ` - ${offer.user.company}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {offer.city}/{offer.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {offer.deliveryType}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link href={`/offers/${offer.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver Oferta
                      </Button>
                    </Link>
                    <form
                      action={async () => {
                        "use server"
                        const { toggleSaveOffer } = await import(
                          "@/lib/actions"
                        )
                        await toggleSaveOffer(offer.id)
                      }}
                      className="flex-1"
                    >
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
                      >
                        <BookmarkX className="h-3.5 w-3.5" />
                        Remover
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

export default async function DashboardOffersPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="p-6 lg:p-8">
      {session.role === "PRODUTOR" ? (
        <ProdutorOffers sessionId={session.id} />
      ) : (
        <CompradorOffers sessionId={session.id} />
      )}
    </div>
  )
}
