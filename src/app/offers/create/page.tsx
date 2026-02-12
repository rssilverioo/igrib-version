import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import Navbar from "@/components/navbar"
import CreateOfferForm from "@/components/create-offer-form"

export const metadata = {
  title: "Nova Oferta - IGRIB",
  description: "Crie uma nova oferta no marketplace B2B do agronegócio.",
}

export default async function CreateOfferPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <CreateOfferForm />
      </main>
    </div>
  )
}
