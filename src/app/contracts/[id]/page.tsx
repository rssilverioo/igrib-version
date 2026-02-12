import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, ArrowLeft, CheckCircle, Calendar, MapPin, Package, DollarSign, Truck, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { id } = await params

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      negotiation: {
        include: {
          offer: true,
          user1: true,
          user2: true,
        },
      },
      generatedBy: true,
    },
  })

  if (!contract) redirect("/dashboard")

  const { negotiation } = contract
  const isParticipant = negotiation.user1Id === session.id || negotiation.user2Id === session.id
  if (!isParticipant) redirect("/dashboard")

  const contractData = JSON.parse(contract.content) as {
    product: string
    quantity: number
    unit: string
    price: number
    city: string
    state: string
    deliveryType: string
    deliveryDate: string | null
    paymentTerms: string
    acceptedAt: string
  }

  const seller = negotiation.user1.role === "PRODUTOR" ? negotiation.user1 : negotiation.user2
  const buyer = negotiation.user1.role === "COMPRADOR" ? negotiation.user1 : negotiation.user2

  const paymentLabel: Record<string, string> = {
    a_vista: "À Vista",
    "7_dias": "7 dias",
    "30_dias": "30 dias",
  }

  const totalValue = contractData.price * contractData.quantity

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href={`/negotiations/${contract.negotiationId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar à negociação
          </Link>
        </div>

        {/* Contract Header */}
        <Card className="mb-6 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Contrato de Compra e Venda</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Contrato #{contract.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-primary text-primary-foreground">
                <CheckCircle className="h-3 w-3 mr-1" />
                {contract.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Contract Body */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">CONTRATO DE COMPRA E VENDA DE GRÃOS</h1>
              <p className="text-muted-foreground mt-2">IGRIB - Plataforma B2B do Agronegócio</p>
              <Separator className="mt-6" />
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Vendedor</h3>
                <p className="font-medium text-lg">{seller.name}</p>
                {seller.company && <p className="text-muted-foreground">{seller.company}</p>}
                {seller.document && <p className="text-sm text-muted-foreground">CPF/CNPJ: {seller.document}</p>}
                {seller.city && seller.state && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {seller.city} - {seller.state}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Comprador</h3>
                <p className="font-medium text-lg">{buyer.name}</p>
                {buyer.company && <p className="text-muted-foreground">{buyer.company}</p>}
                {buyer.document && <p className="text-sm text-muted-foreground">CPF/CNPJ: {buyer.document}</p>}
                {buyer.city && buyer.state && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {buyer.city} - {buyer.state}
                  </p>
                )}
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Contract Details */}
            <h3 className="font-semibold text-lg mb-4">Detalhes da Negociação</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Produto</p>
                  <p className="font-medium">{contractData.product}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Quantidade</p>
                  <p className="font-medium">{contractData.quantity.toLocaleString("pt-BR")} {contractData.unit}(s)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Preço por {contractData.unit}</p>
                  <p className="font-medium">R$ {contractData.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-medium text-primary">R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                  <p className="font-medium">{contractData.city} - {contractData.state}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Entrega</p>
                  <p className="font-medium">{contractData.deliveryType}</p>
                </div>
              </div>

              {contractData.deliveryDate && (
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Prazo de Entrega</p>
                    <p className="font-medium">{contractData.deliveryDate}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                  <p className="font-medium">{paymentLabel[contractData.paymentTerms] || contractData.paymentTerms}</p>
                </div>
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Terms */}
            <h3 className="font-semibold text-lg mb-4">Termos e Condições</h3>
            <div className="space-y-3 text-sm text-muted-foreground mb-8">
              <p>1. O vendedor compromete-se a entregar o produto na quantidade e qualidade acordadas.</p>
              <p>2. O comprador compromete-se a efetuar o pagamento conforme as condições estabelecidas.</p>
              <p>3. Em caso de descumprimento, a parte infratora será responsável por perdas e danos.</p>
              <p>4. A entrega deverá ser realizada no local e prazo acordados, sob modalidade {contractData.deliveryType}.</p>
              <p>5. Este contrato é regido pelas leis brasileiras e quaisquer disputas serão resolvidas no foro da comarca do vendedor.</p>
              <p>6. Ambas as partes declaram estar cientes e de acordo com todos os termos aqui estabelecidos.</p>
            </div>

            <Separator className="mb-8" />

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-b border-dashed border-muted-foreground/30 pb-2 mb-2 h-16 flex items-end justify-center">
                  <p className="text-muted-foreground/50 text-sm italic">Assinatura digital (em breve)</p>
                </div>
                <p className="font-medium">{seller.name}</p>
                <p className="text-sm text-muted-foreground">Vendedor</p>
              </div>
              <div className="text-center">
                <div className="border-b border-dashed border-muted-foreground/30 pb-2 mb-2 h-16 flex items-end justify-center">
                  <p className="text-muted-foreground/50 text-sm italic">Assinatura digital (em breve)</p>
                </div>
                <p className="font-medium">{buyer.name}</p>
                <p className="text-sm text-muted-foreground">Comprador</p>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground">
              <p>Contrato gerado automaticamente pela plataforma IGRIB</p>
              <p>Data de emissão: {new Date(contract.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
              <p>Acordo firmado em: {new Date(contractData.acceptedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => {}} className="gap-2" disabled>
            <Download className="h-4 w-4" />
            Baixar PDF (em breve)
          </Button>
          <Link href="/dashboard">
            <Button variant="default" className="gap-2">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
