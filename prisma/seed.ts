import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clean up
  await prisma.contract.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.message.deleteMany()
  await prisma.negotiation.deleteMany()
  await prisma.savedOffer.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash("123456", 12)

  // Create users
  const produtor1 = await prisma.user.create({
    data: {
      name: "João Silva",
      email: "joao@igrib.com",
      password,
      role: "PRODUTOR",
      company: "Fazenda São João",
      document: "12.345.678/0001-90",
      phone: "(65) 99999-1234",
      city: "Sorriso",
      state: "MT",
    },
  })

  const produtor2 = await prisma.user.create({
    data: {
      name: "Maria Souza",
      email: "maria@igrib.com",
      password,
      role: "PRODUTOR",
      company: "Agro Souza Ltda",
      document: "98.765.432/0001-10",
      phone: "(43) 99888-5678",
      city: "Londrina",
      state: "PR",
    },
  })

  const produtor3 = await prisma.user.create({
    data: {
      name: "Carlos Oliveira",
      email: "carlos@igrib.com",
      password,
      role: "PRODUTOR",
      company: "Fazenda Oliveira",
      document: "45.678.901/0001-23",
      phone: "(62) 99777-4321",
      city: "Rio Verde",
      state: "GO",
    },
  })

  const comprador1 = await prisma.user.create({
    data: {
      name: "Ana Costa",
      email: "ana@igrib.com",
      password,
      role: "COMPRADOR",
      company: "Cerealista Costa & Cia",
      document: "11.222.333/0001-44",
      phone: "(11) 99666-7890",
      city: "São Paulo",
      state: "SP",
    },
  })

  const comprador2 = await prisma.user.create({
    data: {
      name: "Roberto Mendes",
      email: "roberto@igrib.com",
      password,
      role: "COMPRADOR",
      company: "Cooperativa Agrícola Central",
      document: "55.666.777/0001-88",
      phone: "(51) 99555-3210",
      city: "Porto Alegre",
      state: "RS",
    },
  })

  // Create offers
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        product: "Soja",
        quantity: 500,
        unit: "tonelada",
        price: 135.5,
        city: "Sorriso",
        state: "MT",
        deliveryType: "FOB",
        availableDate: new Date("2026-03-15"),
        description: "Soja grão, safra 2025/2026. Padrão exportação. Umidade máxima 14%.",
        userId: produtor1.id,
      },
    }),
    prisma.offer.create({
      data: {
        product: "Milho",
        quantity: 300,
        unit: "tonelada",
        price: 62.0,
        city: "Sorriso",
        state: "MT",
        deliveryType: "CIF",
        availableDate: new Date("2026-04-01"),
        description: "Milho segunda safra. Entrega no armazém do comprador.",
        userId: produtor1.id,
      },
    }),
    prisma.offer.create({
      data: {
        product: "Soja",
        quantity: 200,
        unit: "tonelada",
        price: 138.0,
        city: "Londrina",
        state: "PR",
        deliveryType: "FOB",
        availableDate: new Date("2026-03-20"),
        description: "Soja convencional, alta qualidade. Disponível para retirada na fazenda.",
        userId: produtor2.id,
      },
    }),
    prisma.offer.create({
      data: {
        product: "Trigo",
        quantity: 150,
        unit: "tonelada",
        price: 95.0,
        city: "Londrina",
        state: "PR",
        deliveryType: "FOB",
        availableDate: new Date("2026-05-10"),
        description: "Trigo tipo 1, panificação. Safra de inverno.",
        userId: produtor2.id,
      },
    }),
    prisma.offer.create({
      data: {
        product: "Milho",
        quantity: 1000,
        unit: "tonelada",
        price: null,
        city: "Rio Verde",
        state: "GO",
        deliveryType: "CIF",
        availableDate: new Date("2026-04-15"),
        description: "Milho safrinha, grande volume disponível. Preço a negociar conforme volume.",
        userId: produtor3.id,
      },
    }),
    prisma.offer.create({
      data: {
        product: "Café",
        quantity: 50,
        unit: "saca",
        price: 1250.0,
        city: "Rio Verde",
        state: "GO",
        deliveryType: "FOB",
        availableDate: new Date("2026-03-01"),
        description: "Café arábica, tipo 6, bebida dura. Qualidade premium.",
        userId: produtor3.id,
      },
    }),
    prisma.offer.create({
      data: {
        product: "Algodão",
        quantity: 80,
        unit: "tonelada",
        price: 450.0,
        city: "Sorriso",
        state: "MT",
        deliveryType: "FOB",
        availableDate: new Date("2026-06-01"),
        description: "Algodão em pluma, padrão exportação.",
        userId: produtor1.id,
      },
    }),
    prisma.offer.create({
      data: {
        product: "Arroz",
        quantity: 120,
        unit: "tonelada",
        price: 85.0,
        city: "Porto Alegre",
        state: "RS",
        deliveryType: "CIF",
        availableDate: new Date("2026-03-25"),
        description: "Arroz tipo 1, longo fino. Entrega em todo RS.",
        userId: produtor2.id,
      },
    }),
  ])

  // Save some offers for buyers
  await prisma.savedOffer.create({
    data: { userId: comprador1.id, offerId: offers[0].id },
  })
  await prisma.savedOffer.create({
    data: { userId: comprador1.id, offerId: offers[2].id },
  })
  await prisma.savedOffer.create({
    data: { userId: comprador2.id, offerId: offers[4].id },
  })

  // Create a negotiation with messages and proposals
  const negotiation1 = await prisma.negotiation.create({
    data: {
      offerId: offers[0].id,
      user1Id: comprador1.id,
      user2Id: produtor1.id,
      status: "ABERTA",
    },
  })

  await prisma.message.create({
    data: {
      content: "Negociação iniciada para Soja - 500 tonelada",
      type: "SYSTEM",
      senderId: comprador1.id,
      negotiationId: negotiation1.id,
    },
  })

  await prisma.message.create({
    data: {
      content: "Olá João! Tenho interesse nas 500 toneladas de soja. Podemos negociar?",
      type: "TEXT",
      senderId: comprador1.id,
      negotiationId: negotiation1.id,
    },
  })

  await prisma.message.create({
    data: {
      content: "Olá Ana! Claro, a soja está disponível. Qual volume você precisa?",
      type: "TEXT",
      senderId: produtor1.id,
      negotiationId: negotiation1.id,
    },
  })

  await prisma.message.create({
    data: {
      content: "Preciso de 200 toneladas inicialmente. Vou enviar uma proposta formal.",
      type: "TEXT",
      senderId: comprador1.id,
      negotiationId: negotiation1.id,
    },
  })

  const proposal1 = await prisma.proposal.create({
    data: {
      product: "Soja",
      quantity: 200,
      unit: "tonelada",
      price: 130.0,
      city: "Sorriso",
      state: "MT",
      deliveryType: "FOB",
      deliveryDate: "até 15/03/2026",
      paymentTerms: "30_dias",
      observation: "Primeira compra, esperamos fechar parceria de longo prazo.",
      status: "PENDENTE",
      senderId: comprador1.id,
      negotiationId: negotiation1.id,
    },
  })

  await prisma.message.create({
    data: {
      content: `PROPOSAL:${proposal1.id}`,
      type: "SYSTEM",
      senderId: comprador1.id,
      negotiationId: negotiation1.id,
    },
  })

  // Second negotiation - already closed
  const negotiation2 = await prisma.negotiation.create({
    data: {
      offerId: offers[2].id,
      user1Id: comprador2.id,
      user2Id: produtor2.id,
      status: "FECHADA",
    },
  })

  await prisma.message.create({
    data: {
      content: "Negociação iniciada para Soja - 200 tonelada",
      type: "SYSTEM",
      senderId: comprador2.id,
      negotiationId: negotiation2.id,
    },
  })

  await prisma.message.create({
    data: {
      content: "Boa tarde Maria, gostaria de comprar toda a soja disponível.",
      type: "TEXT",
      senderId: comprador2.id,
      negotiationId: negotiation2.id,
    },
  })

  const proposal2 = await prisma.proposal.create({
    data: {
      product: "Soja",
      quantity: 200,
      unit: "tonelada",
      price: 136.0,
      city: "Londrina",
      state: "PR",
      deliveryType: "FOB",
      deliveryDate: "até 20/03/2026",
      paymentTerms: "7_dias",
      status: "ACEITA",
      senderId: comprador2.id,
      negotiationId: negotiation2.id,
    },
  })

  await prisma.message.create({
    data: {
      content: `PROPOSAL:${proposal2.id}`,
      type: "SYSTEM",
      senderId: comprador2.id,
      negotiationId: negotiation2.id,
    },
  })

  await prisma.message.create({
    data: {
      content: "Roberto aceitou a proposta.",
      type: "SYSTEM",
      senderId: produtor2.id,
      negotiationId: negotiation2.id,
    },
  })

  await prisma.contract.create({
    data: {
      content: JSON.stringify({
        product: "Soja",
        quantity: 200,
        unit: "tonelada",
        price: 136.0,
        city: "Londrina",
        state: "PR",
        deliveryType: "FOB",
        deliveryDate: "até 20/03/2026",
        paymentTerms: "7_dias",
        acceptedAt: new Date().toISOString(),
      }),
      negotiationId: negotiation2.id,
      generatedById: produtor2.id,
    },
  })

  console.log("Seed completed!")
  console.log("")
  console.log("Test accounts (password: 123456):")
  console.log("  Produtor: joao@igrib.com")
  console.log("  Produtor: maria@igrib.com")
  console.log("  Produtor: carlos@igrib.com")
  console.log("  Comprador: ana@igrib.com")
  console.log("  Comprador: roberto@igrib.com")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
