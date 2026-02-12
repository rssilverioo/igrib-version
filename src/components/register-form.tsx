"use client"

import { useActionState, useState } from "react"
import { registerAction } from "@/lib/actions"
import { STATES } from "@/lib/constants"
import Link from "next/link"
import {
  User,
  Mail,
  Lock,
  Building2,
  FileText,
  Phone,
  MapPin,
  Map,
  UserPlus,
  Sprout,
  ShoppingCart,
  Wheat,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, null)
  const [role, setRole] = useState<string>("")

  return (
    <Card className="shadow-xl border-border/50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Criar nova conta</CardTitle>
        <CardDescription>
          Preencha seus dados para começar a negociar no marketplace
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Tipo de conta</Label>
            <input type="hidden" name="role" value={role} />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("PRODUTOR")}
                className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer ${
                  role === "PRODUTOR"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    role === "PRODUTOR"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  }`}
                >
                  <Wheat className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Produtor</p>
                  <p className="text-xs text-muted-foreground">
                    Venda sua produção
                  </p>
                </div>
                {role === "PRODUTOR" && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setRole("COMPRADOR")}
                className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer ${
                  role === "COMPRADOR"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    role === "COMPRADOR"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  }`}
                >
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Comprador</p>
                  <p className="text-xs text-muted-foreground">
                    Encontre fornecedores
                  </p>
                </div>
                {role === "COMPRADOR" && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Personal Info - Two column on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                  autoComplete="name"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
                className="pl-10"
              />
            </div>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Nome da empresa"
                  autoComplete="organization"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CPF/CNPJ</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="document"
                  name="document"
                  type="text"
                  placeholder="000.000.000-00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                autoComplete="tel"
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Sua cidade"
                  autoComplete="address-level2"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Select name="state">
                  <SelectTrigger id="state" className="w-full pl-10">
                    <SelectValue placeholder="Selecione" />
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
            </div>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={pending || !role}
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Criando conta...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Criar conta
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-0">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Já tem uma conta?
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full cursor-pointer" asChild>
          <Link href="/login">
            <Sprout className="h-4 w-4 mr-1" />
            Entrar na minha conta
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
