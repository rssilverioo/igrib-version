"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Sprout, LogOut, User, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { logoutAction } from "@/lib/actions"

interface NavbarUser {
  id: string
  name: string
  email: string
  role: string
  company: string | null
}

interface NavbarProps {
  user?: NavbarUser | null
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getRoleBadge(role: string) {
  const isProdutor = role === "PRODUTOR"
  return (
    <Badge
      variant="secondary"
      className={
        isProdutor
          ? "bg-green-100 text-green-800 hover:bg-green-100"
          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
      }
    >
      {role}
    </Badge>
  )
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

export default function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Sprout className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">IGRIB</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Desktop User Area */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col gap-1 px-2 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                  {user.company && (
                    <p className="mt-1 text-xs text-muted-foreground">{user.company}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex cursor-pointer items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center gap-2 text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Cadastro
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-10">
              <div className="flex flex-col gap-6">
                {/* Mobile Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Sprout className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">IGRIB</span>
                </Link>

                {/* Mobile User Info */}
                {user && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  {user && (
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                      >
                        <User className="h-5 w-5" />
                        Meu Perfil
                      </Button>
                    </Link>
                  )}
                </nav>

                {/* Mobile Auth Actions */}
                <div className="mt-auto border-t pt-4">
                  {user ? (
                    <form action={logoutAction}>
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <LogOut className="h-5 w-5" />
                        Sair
                      </Button>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          Cadastro
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
