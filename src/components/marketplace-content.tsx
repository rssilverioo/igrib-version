"use client"

import { useState, useMemo, useTransition } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Search,
  Filter,
  MapPin,
  Package,
  Truck,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Plus,
  SlidersHorizontal,
  X,
  Building2,
  User,
} from "lucide-react"
import { PRODUCTS, STATES, PRODUCT_ICONS } from "@/lib/constants"
import { startNegotiation, toggleSaveOffer } from "@/lib/actions"

type OfferWithUser = {
  id: string
  product: string
  quantity: number
  unit: string
  price: number | null
  city: string
  state: string
  deliveryType: string
  availableDate: string | null
  description: string | null
  status: string
  createdAt: string
  userId: string
  user: { id: string; name: string; company: string | null; role: string }
}

interface MarketplaceContentProps {
  offers: OfferWithUser[]
  savedOfferIds: string[]
  currentUserId: string | null
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Imediata"
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatPrice(price: number | null): string {
  if (price === null) return "A negociar"
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function formatQuantity(quantity: number, unit: string): string {
  const formatted = quantity.toLocaleString("pt-BR")
  const unitLabel = unit === "tonelada" ? (quantity === 1 ? "tonelada" : "toneladas") : (quantity === 1 ? "saca" : "sacas")
  return `${formatted} ${unitLabel}`
}

export default function MarketplaceContent({
  offers,
  savedOfferIds: initialSavedOfferIds,
  currentUserId,
}: MarketplaceContentProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [productFilter, setProductFilter] = useState<string>("all")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Optimistic saved offers
  const [savedOfferIds, setSavedOfferIds] = useState<string[]>(initialSavedOfferIds)

  // Transition for server actions
  const [isPending, startTransition] = useTransition()

  const hasActiveFilters =
    searchQuery !== "" ||
    productFilter !== "all" ||
    stateFilter !== "all" ||
    deliveryFilter !== "all" ||
    minPrice !== "" ||
    maxPrice !== ""

  function clearFilters() {
    setSearchQuery("")
    setProductFilter("all")
    setStateFilter("all")
    setDeliveryFilter("all")
    setMinPrice("")
    setMaxPrice("")
  }

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          offer.product.toLowerCase().includes(query) ||
          offer.city.toLowerCase().includes(query) ||
          offer.state.toLowerCase().includes(query) ||
          (offer.user.company?.toLowerCase().includes(query) ?? false) ||
          offer.user.name.toLowerCase().includes(query) ||
          (offer.description?.toLowerCase().includes(query) ?? false)
        if (!matchesSearch) return false
      }

      // Product filter
      if (productFilter !== "all" && offer.product !== productFilter) return false

      // State filter
      if (stateFilter !== "all" && offer.state !== stateFilter) return false

      // Delivery type filter
      if (deliveryFilter !== "all" && offer.deliveryType !== deliveryFilter) return false

      // Price range
      if (minPrice !== "") {
        const min = parseFloat(minPrice)
        if (!isNaN(min)) {
          if (offer.price === null || offer.price < min) return false
        }
      }
      if (maxPrice !== "") {
        const max = parseFloat(maxPrice)
        if (!isNaN(max)) {
          if (offer.price === null || offer.price > max) return false
        }
      }

      return true
    })
  }, [offers, searchQuery, productFilter, stateFilter, deliveryFilter, minPrice, maxPrice])

  function handleToggleSave(offerId: string) {
    // Optimistic update
    setSavedOfferIds((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]
    )
    startTransition(async () => {
      await toggleSaveOffer(offerId)
    })
  }

  function handleNegotiate(offerId: string) {
    startTransition(async () => {
      await startNegotiation(offerId)
    })
  }

  // Shared filter controls (used in both sidebar and mobile sheet)
  function FilterControls() {
    return (
      <div className="flex flex-col gap-5">
        {/* Product Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Produto</label>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os produtos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              {PRODUCTS.map((product) => (
                <SelectItem key={product} value={product}>
                  <span className="flex items-center gap-2">
                    <span>{PRODUCT_ICONS[product]}</span>
                    <span>{product}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Estado</label>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              {STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delivery Type Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Tipo de Entrega</label>
          <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="FOB">FOB</SelectItem>
              <SelectItem value="CIF">CIF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Faixa de Preco (R$)</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1"
              min={0}
            />
            <span className="text-sm text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1"
              min={0}
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full gap-2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace</h1>
            <p className="mt-1 text-muted-foreground">
              Encontre as melhores ofertas de graos e negocie diretamente com produtores e compradores.
            </p>
          </div>
          {currentUserId && (
            <Link href="/offers/create">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Criar Oferta
              </Button>
            </Link>
          )}
        </div>

        {/* Search Bar + Mobile Filter Toggle */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto, cidade, empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Mobile filter button */}
          <div className="lg:hidden">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      !
                    </span>
                  )}
                  <span className="sr-only">Filtros</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Filtros
                  </SheetTitle>
                  <SheetDescription>
                    Refine sua busca no marketplace
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <FilterControls />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filtros ativos:</span>
            {productFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {PRODUCT_ICONS[productFilter]} {productFilter}
                <button onClick={() => setProductFilter("all")} className="ml-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {stateFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                {stateFilter}
                <button onClick={() => setStateFilter("all")} className="ml-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {deliveryFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Truck className="h-3 w-3" />
                {deliveryFilter}
                <button onClick={() => setDeliveryFilter("all")} className="ml-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(minPrice || maxPrice) && (
              <Badge variant="secondary" className="gap-1 text-xs">
                R$ {minPrice || "0"} - {maxPrice || "\u221E"}
                <button
                  onClick={() => {
                    setMinPrice("")
                    setMaxPrice("")
                  }}
                  className="ml-0.5 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Search className="h-3 w-3" />
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="ml-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-primary hover:underline"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border bg-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
            </div>
            <FilterControls />
          </div>
        </aside>

        {/* Offers Grid */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredOffers.length === 1
                ? "1 oferta encontrada"
                : `${filteredOffers.length} ofertas encontradas`}
            </p>
          </div>

          {filteredOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Nenhuma oferta encontrada</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Tente ajustar os filtros para ver mais resultados."
                  : "Ainda nao existem ofertas ativas no marketplace."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4 gap-2">
                  <X className="h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredOffers.map((offer) => {
                const isSaved = savedOfferIds.includes(offer.id)
                const isOwnOffer = currentUserId === offer.userId

                return (
                  <Card
                    key={offer.id}
                    className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30"
                  >
                    {/* Product Header */}
                    <CardHeader className="pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
                            {PRODUCT_ICONS[offer.product] || "\uD83C\uDF3E"}
                          </span>
                          <div>
                            <CardTitle className="text-base">{offer.product}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {formatQuantity(offer.quantity, offer.unit)}
                            </p>
                          </div>
                        </div>
                        {/* Bookmark button */}
                        {currentUserId && !isOwnOffer && (
                          <button
                            onClick={() => handleToggleSave(offer.id)}
                            disabled={isPending}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-50"
                            title={isSaved ? "Remover dos salvos" : "Salvar oferta"}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-5 w-5 text-primary" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 pt-0">
                      {/* Price */}
                      <div className="mt-1">
                        <span
                          className={`text-lg font-bold ${
                            offer.price !== null ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {formatPrice(offer.price)}
                        </span>
                        {offer.price !== null && (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            / {offer.unit}
                          </span>
                        )}
                      </div>

                      {/* Info rows */}
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {offer.city} - {offer.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>Disponivel: {formatDate(offer.availableDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Truck className="h-3.5 w-3.5 shrink-0" />
                          <Badge
                            variant="outline"
                            className={`text-[11px] ${
                              offer.deliveryType === "CIF"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {offer.deliveryType}
                          </Badge>
                        </div>
                      </div>

                      {/* Description preview */}
                      {offer.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                          {offer.description}
                        </p>
                      )}

                      {/* Seller info */}
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                        {offer.user.company ? (
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate text-xs font-medium text-foreground">
                          {offer.user.company || offer.user.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`ml-auto text-[10px] ${
                            offer.user.role === "PRODUTOR"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {offer.user.role === "PRODUTOR" ? "Produtor" : "Comprador"}
                        </Badge>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      {isOwnOffer ? (
                        <Badge variant="secondary" className="w-full justify-center py-1.5 text-xs">
                          Sua oferta
                        </Badge>
                      ) : currentUserId ? (
                        <Button
                          onClick={() => handleNegotiate(offer.id)}
                          disabled={isPending}
                          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                          size="sm"
                        >
                          <Package className="h-4 w-4" />
                          Negociar
                        </Button>
                      ) : (
                        <Link href="/login" className="w-full">
                          <Button
                            variant="outline"
                            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
                            size="sm"
                          >
                            <Package className="h-4 w-4" />
                            Entrar para Negociar
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
