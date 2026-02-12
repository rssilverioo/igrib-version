"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Globe,
  MessageSquare,
  FileText,
  Truck,
  Search,
  Handshake,
  TrendingDown,
  ShieldCheck,
} from "lucide-react"

const produtorBenefits = [
  {
    icon: Globe,
    title: "Alcance nacional",
    description:
      "Sua produção visível para compradores de todo o Brasil. Amplie sua rede de clientes sem intermediários.",
  },
  {
    icon: MessageSquare,
    title: "Propostas diretas",
    description:
      "Receba propostas formalizadas com preço, quantidade e condições. Negocie diretamente no chat.",
  },
  {
    icon: FileText,
    title: "Contratos automáticos",
    description:
      "Ao aceitar uma proposta, o contrato é gerado automaticamente com todos os termos acordados.",
  },
  {
    icon: Truck,
    title: "Logística simplificada",
    description:
      "Defina FOB ou CIF, combine prazos e alinhe toda a operação logística dentro da plataforma.",
  },
]

const compradorBenefits = [
  {
    icon: Search,
    title: "Catálogo amplo",
    description:
      "Acesse ofertas de soja, milho, trigo, café e mais. Filtre por produto, região, preço e tipo de entrega.",
  },
  {
    icon: Handshake,
    title: "Negociação direta",
    description:
      "Converse direto com o produtor. Sem intermediários, sem comissões escondidas. Transparência total.",
  },
  {
    icon: TrendingDown,
    title: "Preços competitivos",
    description:
      "Compare ofertas de diferentes produtores e regiões. Encontre as melhores condições para sua operação.",
  },
  {
    icon: ShieldCheck,
    title: "Rastreabilidade",
    description:
      "Histórico completo de negociações, propostas e contratos. Tudo documentado e acessível.",
  },
]

export default function RoleBenefitsTabs() {
  const [activeTab, setActiveTab] = useState<"produtor" | "comprador">("produtor")

  const benefits = activeTab === "produtor" ? produtorBenefits : compradorBenefits

  return (
    <div>
      {/* Tab Buttons */}
      <div className="mx-auto mb-12 flex max-w-md overflow-hidden rounded-xl border bg-muted/50 p-1">
        <button
          onClick={() => setActiveTab("produtor")}
          className={cn(
            "flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all",
            activeTab === "produtor"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sou Produtor
        </button>
        <button
          onClick={() => setActiveTab("comprador")}
          className={cn(
            "flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all",
            activeTab === "comprador"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sou Comprador
        </button>
      </div>

      {/* Benefits Grid */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-8"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <benefit.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {benefit.title}
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
