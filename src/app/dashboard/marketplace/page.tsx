import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import MarketplaceContent from "@/components/marketplace-content"

export default async function DashboardMarketplacePage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const offers = await prisma.offer.findMany({
    where: { status: "ATIVA" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })

  const savedOffers = await prisma.savedOffer.findMany({
    where: { userId: session.id },
  })

  const savedOfferIds = savedOffers.map((s) => s.offerId)

  const serializedOffers = offers.map((offer) => ({
    id: offer.id,
    product: offer.product,
    quantity: offer.quantity,
    unit: offer.unit,
    price: offer.price,
    city: offer.city,
    state: offer.state,
    deliveryType: offer.deliveryType,
    availableDate: offer.availableDate ? offer.availableDate.toISOString() : null,
    description: offer.description,
    status: offer.status,
    createdAt: offer.createdAt.toISOString(),
    userId: offer.userId,
    user: {
      id: offer.user.id,
      name: offer.user.name,
      company: offer.user.company,
      role: offer.user.role,
    },
  }))

  return (
    <MarketplaceContent
      offers={serializedOffers}
      savedOfferIds={savedOfferIds}
      currentUserId={session.id}
    />
  )
}
