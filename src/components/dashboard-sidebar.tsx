"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Store,
  Package,
  Bookmark,
  MessageSquare,
  CheckCircle,
  ShoppingCart,
  Menu,
  Sprout,
  LogOut,
  Plus,
} from "lucide-react"
import { logoutAction } from "@/lib/actions"

interface SidebarUser {
  id: string
  name: string
  email: string
  role: string
  company: string | null
}

interface DashboardSidebarProps {
  user: SidebarUser
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

function getNavLinks(role: string) {
  const isProdutor = role === "PRODUTOR"
  return [
    {
      href: "/dashboard/marketplace",
      label: "Marketplace",
      icon: Store,
    },
    {
      href: "/dashboard/offers",
      label: isProdutor ? "Minhas Ofertas" : "Ofertas Salvas",
      icon: isProdutor ? Package : Bookmark,
    },
    {
      href: "/dashboard/negotiations",
      label: "Negociações",
      icon: MessageSquare,
    },
    {
      href: "/dashboard/history",
      label: isProdutor ? "Negócios Fechados" : "Histórico",
      icon: isProdutor ? CheckCircle : ShoppingCart,
    },
  ]
}

function SidebarContent({
  user,
  pathname,
  onLinkClick,
}: {
  user: SidebarUser
  pathname: string
  onLinkClick?: () => void
}) {
  const links = getNavLinks(user.role)

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-5">
        <Sprout className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold tracking-tight text-foreground">IGRIB</span>
      </div>

      {/* User Info */}
      <div className="mx-3 mb-4 rounded-xl bg-muted/50 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <Badge
              variant="secondary"
              className={cn(
                "mt-1 text-[10px]",
                user.role === "PRODUTOR"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              )}
            >
              {user.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link key={link.href} href={link.href} onClick={onLinkClick}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {link.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Quick Action */}
      {user.role === "PRODUTOR" && (
        <div className="px-3 pb-2">
          <Link href="/offers/create" onClick={onLinkClick}>
            <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
              <Plus className="h-4 w-4" />
              Nova Oferta
            </Button>
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="border-t px-3 py-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </div>
  )
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-full flex-col border-r bg-card">
          <SidebarContent user={user} pathname={pathname} />
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent
              user={user}
              pathname={pathname}
              onLinkClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">IGRIB</span>
        </div>
      </div>
    </>
  )
}
