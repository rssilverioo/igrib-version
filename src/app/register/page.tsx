import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { RegisterForm } from "@/components/register-form"
import { Sprout } from "lucide-react"

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect("/marketplace")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-background to-green-50/50 px-4 py-12">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-agro/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-agro/5 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary text-primary-foreground shadow-lg mb-4">
            <Sprout className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            IGRIB
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Crie sua conta no marketplace do agro
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  )
}
