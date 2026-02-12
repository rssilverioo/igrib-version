import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import NegotiationRoom from "@/components/negotiation-room"

export default async function NegotiationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { id } = await params

  const negotiation = await prisma.negotiation.findUnique({
    where: { id },
    include: {
      offer: true,
      user1: true,
      user2: true,
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
      proposals: { orderBy: { createdAt: "asc" }, include: { sender: true } },
      contract: true,
    },
  })

  if (!negotiation) redirect("/dashboard/marketplace")

  // Verify the current user is a participant
  const isParticipant =
    negotiation.user1Id === session.id || negotiation.user2Id === session.id
  if (!isParticipant) redirect("/dashboard/marketplace")

  // Determine the other user
  const otherUser =
    negotiation.user1Id === session.id ? negotiation.user2 : negotiation.user1

  // Serialize dates for client component
  const serializedNegotiation = {
    id: negotiation.id,
    status: negotiation.status,
    offer: {
      id: negotiation.offer.id,
      product: negotiation.offer.product,
      quantity: negotiation.offer.quantity,
      unit: negotiation.offer.unit,
      price: negotiation.offer.price,
      city: negotiation.offer.city,
      state: negotiation.offer.state,
      deliveryType: negotiation.offer.deliveryType,
    },
    user1: {
      id: negotiation.user1.id,
      name: negotiation.user1.name,
      company: negotiation.user1.company,
    },
    user2: {
      id: negotiation.user2.id,
      name: negotiation.user2.name,
      company: negotiation.user2.company,
    },
    contract: negotiation.contract
      ? { id: negotiation.contract.id }
      : null,
  }

  const serializedMessages = negotiation.messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    type: msg.type,
    fileUrl: msg.fileUrl,
    fileName: msg.fileName,
    createdAt: msg.createdAt.toISOString(),
    senderId: msg.senderId,
    sender: {
      id: msg.sender.id,
      name: msg.sender.name,
    },
  }))

  const serializedProposals = negotiation.proposals.map((prop) => ({
    id: prop.id,
    product: prop.product,
    quantity: prop.quantity,
    unit: prop.unit,
    price: prop.price,
    city: prop.city,
    state: prop.state,
    deliveryType: prop.deliveryType,
    deliveryDate: prop.deliveryDate,
    paymentTerms: prop.paymentTerms,
    observation: prop.observation,
    status: prop.status,
    createdAt: prop.createdAt.toISOString(),
    senderId: prop.senderId,
    sender: {
      id: prop.sender.id,
      name: prop.sender.name,
    },
  }))

  const serializedOtherUser = {
    id: otherUser.id,
    name: otherUser.name,
    company: otherUser.company,
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar user={session} />
      <NegotiationRoom
        negotiation={serializedNegotiation}
        messages={serializedMessages}
        proposals={serializedProposals}
        currentUserId={session.id}
        currentUserName={session.name}
        otherUser={serializedOtherUser}
      />
    </div>
  )
}
