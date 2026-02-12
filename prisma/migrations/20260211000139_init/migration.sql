-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PRODUTOR',
    "company" TEXT,
    "document" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'tonelada',
    "price" REAL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL DEFAULT 'FOB',
    "availableDate" DATETIME,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedOffer_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "offerId" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    CONSTRAINT "Negotiation_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Negotiation_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Negotiation_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "negotiationId" TEXT NOT NULL,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "Negotiation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'tonelada',
    "price" REAL NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL DEFAULT 'FOB',
    "deliveryDate" TEXT,
    "paymentTerms" TEXT NOT NULL DEFAULT 'a_vista',
    "observation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "negotiationId" TEXT NOT NULL,
    CONSTRAINT "Proposal_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Proposal_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "Negotiation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GERADO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "negotiationId" TEXT NOT NULL,
    "generatedById" TEXT NOT NULL,
    CONSTRAINT "Contract_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "Negotiation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SavedOffer_userId_offerId_key" ON "SavedOffer"("userId", "offerId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_negotiationId_key" ON "Contract"("negotiationId");
