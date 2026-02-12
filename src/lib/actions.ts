"use server"

import { prisma } from "./prisma"
import { hashPassword, verifyPassword, createSession, destroySession, getSession } from "./auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Auth actions
export async function registerAction(prevState: { error: string } | null, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const company = formData.get("company") as string
  const document = formData.get("document") as string
  const phone = formData.get("phone") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "E-mail já cadastrado" }
  }

  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      company: company || null,
      document: document || null,
      phone: phone || null,
      city: city || null,
      state: state || null,
    },
  })

  await createSession(user.id)
  redirect("/dashboard/marketplace")
}

export async function loginAction(prevState: { error: string } | null, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "Credenciais inválidas" }
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { error: "Credenciais inválidas" }
  }

  await createSession(user.id)
  redirect("/dashboard/marketplace")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

// Offer actions
export async function createOfferAction(prevState: { error?: string } | null, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const product = formData.get("product") as string
  const quantity = formData.get("quantity") as string
  const unit = formData.get("unit") as string
  const priceRaw = formData.get("price") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const deliveryType = formData.get("deliveryType") as string
  const availableDate = formData.get("availableDate") as string
  const description = formData.get("description") as string

  if (!product || !quantity || !unit || !city || !state || !deliveryType) {
    return { error: "Preencha todos os campos obrigatórios." }
  }

  const parsedQuantity = parseFloat(quantity)
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return { error: "Quantidade deve ser um número positivo." }
  }

  const price = priceRaw && priceRaw.trim() !== "" ? parseFloat(priceRaw) : null
  if (price !== null && (isNaN(price) || price <= 0)) {
    return { error: "Preço deve ser um número positivo." }
  }

  try {
    await prisma.offer.create({
      data: {
        product,
        quantity: parsedQuantity,
        unit,
        price,
        city,
        state,
        deliveryType,
        availableDate: availableDate ? new Date(availableDate) : null,
        description: description || null,
        userId: session.id,
      },
    })
  } catch {
    return { error: "Erro ao criar oferta. Tente novamente." }
  }

  revalidatePath("/dashboard/marketplace")
  redirect("/dashboard/marketplace")
}

export async function toggleSaveOffer(offerId: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const existing = await prisma.savedOffer.findUnique({
    where: { userId_offerId: { userId: session.id, offerId } },
  })

  if (existing) {
    await prisma.savedOffer.delete({ where: { id: existing.id } })
  } else {
    await prisma.savedOffer.create({
      data: { userId: session.id, offerId },
    })
  }

  revalidatePath("/dashboard/marketplace")
  revalidatePath("/dashboard/offers")
}

// Negotiation actions
export async function startNegotiation(offerId: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { user: true },
  })

  if (!offer) return { error: "Oferta não encontrada" }
  if (offer.userId === session.id) return { error: "Você não pode negociar sua própria oferta" }

  // Check if negotiation already exists
  const existing = await prisma.negotiation.findFirst({
    where: {
      offerId,
      OR: [
        { user1Id: session.id, user2Id: offer.userId },
        { user1Id: offer.userId, user2Id: session.id },
      ],
      status: "ABERTA",
    },
  })

  if (existing) {
    redirect(`/negotiations/${existing.id}`)
  }

  const negotiation = await prisma.negotiation.create({
    data: {
      offerId,
      user1Id: session.id,
      user2Id: offer.userId,
    },
  })

  // System message
  await prisma.message.create({
    data: {
      content: `Negociação iniciada para ${offer.product} - ${offer.quantity} ${offer.unit}`,
      type: "SYSTEM",
      senderId: session.id,
      negotiationId: negotiation.id,
    },
  })

  redirect(`/negotiations/${negotiation.id}`)
}

export async function sendMessage(negotiationId: string, content: string) {
  const session = await getSession()
  if (!session) return { error: "Não autenticado" }

  await prisma.message.create({
    data: {
      content,
      type: "TEXT",
      senderId: session.id,
      negotiationId,
    },
  })

  revalidatePath(`/negotiations/${negotiationId}`)
}

export async function sendProposal(negotiationId: string, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: "Não autenticado" }

  const proposal = await prisma.proposal.create({
    data: {
      product: formData.get("product") as string,
      quantity: parseFloat(formData.get("quantity") as string),
      unit: formData.get("unit") as string,
      price: parseFloat(formData.get("price") as string),
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      deliveryType: formData.get("deliveryType") as string,
      deliveryDate: formData.get("deliveryDate") as string,
      paymentTerms: formData.get("paymentTerms") as string,
      observation: (formData.get("observation") as string) || null,
      senderId: session.id,
      negotiationId,
    },
  })

  // System message about the proposal
  await prisma.message.create({
    data: {
      content: `PROPOSAL:${proposal.id}`,
      type: "SYSTEM",
      senderId: session.id,
      negotiationId,
    },
  })

  revalidatePath(`/negotiations/${negotiationId}`)
}

export async function respondToProposal(proposalId: string, action: "ACEITA" | "RECUSADA" | "CONTRA_PROPOSTA") {
  const session = await getSession()
  if (!session) return { error: "Não autenticado" }

  const proposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: action },
    include: { negotiation: true },
  })

  const actionLabels = {
    ACEITA: "aceitou",
    RECUSADA: "recusou",
    CONTRA_PROPOSTA: "solicitou contra-proposta para",
  }

  await prisma.message.create({
    data: {
      content: `${session.name} ${actionLabels[action]} a proposta.`,
      type: "SYSTEM",
      senderId: session.id,
      negotiationId: proposal.negotiationId,
    },
  })

  // If accepted, close the negotiation
  if (action === "ACEITA") {
    await prisma.negotiation.update({
      where: { id: proposal.negotiationId },
      data: { status: "FECHADA" },
    })

    // Generate contract
    const contractData = {
      product: proposal.product,
      quantity: proposal.quantity,
      unit: proposal.unit,
      price: proposal.price,
      city: proposal.city,
      state: proposal.state,
      deliveryType: proposal.deliveryType,
      deliveryDate: proposal.deliveryDate,
      paymentTerms: proposal.paymentTerms,
      acceptedAt: new Date().toISOString(),
    }

    await prisma.contract.create({
      data: {
        content: JSON.stringify(contractData),
        negotiationId: proposal.negotiationId,
        generatedById: session.id,
      },
    })
  }

  revalidatePath(`/negotiations/${proposal.negotiationId}`)
}

export async function sendQuickAction(negotiationId: string, actionType: string) {
  const session = await getSession()
  if (!session) return { error: "Não autenticado" }

  const actionMessages: Record<string, string> = {
    "solicitar_contrato": "📄 Solicitação de contrato enviada",
    "solicitar_logistica": "🚚 Solicitação de dados logísticos enviada",
    "solicitar_nf": "📋 Solicitação de nota fiscal enviada",
  }

  const content = actionMessages[actionType] || actionType

  await prisma.message.create({
    data: {
      content,
      type: "SYSTEM",
      senderId: session.id,
      negotiationId,
    },
  })

  revalidatePath(`/negotiations/${negotiationId}`)
}
