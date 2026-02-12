"use client"

import { useActionState } from "react"
import { createOfferAction } from "@/lib/actions"
import { PRODUCTS, STATES, UNITS, DELIVERY_TYPES } from "@/lib/constants"
import {
  Package,
  MapPin,
  Truck,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  ArrowLeft,
  Sprout,
  AlertCircle,
  Scale,
} from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function CreateOfferForm() {
  const [state, formAction, pending] = useActionState(createOfferAction, null)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/marketplace">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Voltar</span>
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Nova Oferta
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados abaixo para publicar sua oferta no marketplace.
          </p>
        </div>
      </div>

      {/* Error display */}
      {state?.error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      <form action={formAction}>
        <div className="space-y-6">
          {/* Product & Quantity Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Produto e Quantidade</CardTitle>
                  <CardDescription>
                    Selecione o produto e informe a quantidade disponível.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Product */}
                <div className="space-y-2">
                  <Label htmlFor="product">
                    Produto <span className="text-destructive">*</span>
                  </Label>
                  <Select name="product" required>
                    <SelectTrigger id="product" className="w-full">
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <Label htmlFor="unit">
                    Unidade <span className="text-destructive">*</span>
                  </Label>
                  <Select name="unit" required>
                    <SelectTrigger id="unit" className="w-full">
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    Quantidade <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Ex: 1000"
                    required
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    Preco por saca/tonelada (opcional)
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Delivery Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Localização e Entrega</CardTitle>
                  <CardDescription>
                    Informe a localização do produto e o tipo de entrega.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">
                    Cidade <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Ex: Londrina"
                    required
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">
                    Estado <span className="text-destructive">*</span>
                  </Label>
                  <Select name="state" required>
                    <SelectTrigger id="state" className="w-full">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Type */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryType">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    Tipo de Entrega <span className="text-destructive">*</span>
                  </Label>
                  <Select name="deliveryType" required>
                    <SelectTrigger id="deliveryType" className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "FOB"
                            ? "FOB - Retirada no local"
                            : "CIF - Entrega inclusa"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Available Date */}
                <div className="space-y-2">
                  <Label htmlFor="availableDate">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Data de Disponibilidade
                  </Label>
                  <Input
                    id="availableDate"
                    name="availableDate"
                    type="date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Observações</CardTitle>
                  <CardDescription>
                    Adicione informações extras sobre sua oferta (opcional).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição / Observações</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ex: Soja com 14% de umidade, padrão exportação. Disponível para retirada imediata no armazém..."
                  className="min-h-[120px] resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/marketplace">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={pending}
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={pending}
              className="w-full gap-2 sm:w-auto"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Sprout className="h-4 w-4" />
                  Publicar Oferta
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
