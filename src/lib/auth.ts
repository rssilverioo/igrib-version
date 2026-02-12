import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

// Simple session management using cookies
const SESSION_COOKIE = "igrib-session"

export async function createSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionId) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: true,
      document: true,
      phone: true,
      city: true,
      state: true,
      avatar: true,
    },
  })

  return user
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
