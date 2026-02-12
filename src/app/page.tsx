import { getSession } from "@/lib/auth"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import RoleBenefitsTabs from "@/components/role-benefits-tabs"
import Image from "next/image"
import {
  UserPlus,
  Search,
  MessageSquare,
  FileText,
  CheckCircle,
  ArrowRight,
  Sprout,
  Wheat,
  ShoppingCart,
} from "lucide-react"
import Link from "next/link"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Cadastre-se",
    description: "Crie sua conta gratuitamente como produtor ou comprador em menos de 2 minutos.",
  },
  {
    number: "02",
    icon: Search,
    title: "Publique ou busque",
    description: "Produtores publicam ofertas. Compradores exploram o marketplace e salvam as melhores.",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Negocie",
    description: "Inicie uma negociação, converse pelo chat e alinhe todos os detalhes da operação.",
  },
  {
    number: "04",
    icon: FileText,
    title: "Envie propostas",
    description: "Formalize a negociação com proposta estruturada: preço, quantidade, entrega e pagamento.",
  },
  {
    number: "05",
    icon: CheckCircle,
    title: "Feche o contrato",
    description: "Ao aceitar a proposta, um contrato digital é gerado automaticamente. Simples assim.",
  },
]

export default async function HomePage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session} />

      {/* Hero Section - Split layout with image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left - Text */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sprout className="h-4 w-4" />
                Plataforma B2B para o Agronegócio
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                Originamos, comercializamos e{" "}
                <span className="text-primary">entregamos o grão</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                O marketplace B2B que conecta produtores rurais a compradores do agronegócio.
                Negocie commodities, envie propostas e feche contratos em um único lugar.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="h-14 gap-2 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90">
                    <Wheat className="h-5 w-5" />
                    Venda seus grãos
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-14 gap-2 border-primary/30 px-8 text-base text-primary hover:bg-primary/5">
                    <ShoppingCart className="h-5 w-5" />
                    Compre uma safra
                  </Button>
                </Link>
              </div>

              {/* Stats inline */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <span className="text-3xl font-bold text-primary">100+</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">Produtores</p>
                </div>
                <div>
                  <span className="text-3xl font-bold text-primary">500+</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">Ofertas ativas</p>
                </div>
                <div>
                  <span className="text-3xl font-bold text-primary">50+</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">Contratos</p>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80"
                  alt="Campo de soja ao pôr do sol"
                  width={800}
                  height={600}
                  className="h-auto w-full object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl border bg-card p-4 shadow-lg sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">+12 contratos</p>
                    <p className="text-xs text-muted-foreground">fechados esta semana</p>
                  </div>
                </div>
              </div>
              {/* Floating card top right */}
              <div className="absolute -right-4 -top-4 rounded-2xl border bg-card p-4 shadow-lg sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Wheat className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Soja, Milho, Café</p>
                    <p className="text-xs text-muted-foreground">e +10 produtos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Showcase - 3 columns with commodities */}
      <section className="border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <div className="group relative overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=350&fit=crop&q=80"
                alt="Soja - grãos de soja"
                width={500}
                height={350}
                className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-lg font-bold text-white">Soja</p>
                <p className="text-sm text-white/80">Principal commodity</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=350&fit=crop&q=80"
                alt="Milho - espigas de milho"
                width={500}
                height={350}
                className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-lg font-bold text-white">Milho</p>
                <p className="text-sm text-white/80">Alta demanda</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&h=350&fit=crop&q=80"
                alt="Café - grãos de café"
                width={500}
                height={350}
                className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-lg font-bold text-white">Café</p>
                <p className="text-sm text-white/80">Qualidade premium</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits by Role - Tabs Section */}
      <section className="border-t bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Feito para quem move o agro
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Seja você produtor ou comprador, a IGRIB tem as ferramentas certas para a sua operação.
            </p>
          </div>

          <div className="mt-14">
            <RoleBenefitsTabs />
          </div>
        </div>
      </section>

      {/* How It Works - Steps with background image */}
      <section className="relative border-t py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=600&fit=crop&q=60"
            alt=""
            fill
            className="object-cover opacity-[0.04]"
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Como funciona
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Da publicação ao contrato em 5 passos simples.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step, index) => (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-8 hidden h-px w-full bg-border lg:block" />
                  )}

                  <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors hover:bg-primary/15">
                    <step.icon className="h-7 w-7" />
                  </div>

                  <span className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Passo {step.number}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA with background image */}
      <section className="relative border-t overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&h=800&fit=crop&q=70"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/85" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pronto para começar?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Cadastre-se gratuitamente e comece a negociar no maior marketplace B2B do agronegócio brasileiro.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="h-14 gap-2 bg-white px-8 text-base text-primary hover:bg-white/90">
                  Criar conta gratuita
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="h-14 px-8 text-base text-white/90 hover:bg-white/10 hover:text-white">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">IGRIB</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} IGRIB. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
