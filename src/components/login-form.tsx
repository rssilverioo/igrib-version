"use client"

import { useActionState } from "react"
import { loginAction } from "@/lib/actions"
import Link from "next/link"
import { Sprout, Mail, Lock, LogIn, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <Card className="shadow-xl border-border/50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
        <CardDescription>
          Acesse o marketplace e gerencie suas negociações
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Sua senha"
                required
                autoComplete="current-password"
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={pending}
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Entrar
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
              Novo por aqui?
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full cursor-pointer" asChild>
          <Link href="/register">
            <Sprout className="h-4 w-4 mr-1" />
            Criar conta gratuita
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
