import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function setSession(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export function getRoleAccess(role: string) {
  const access = {
    ADMIN: {
      dashboard: true,
      inventory: true,
      coldStorage: true,
      procurement: true,
      pos: true,
      stockOpname: true,
      reports: true,
      notifications: true,
      settings: true,
      approvals: true,
    },
    WAREHOUSE_STAFF: {
      dashboard: true,
      inventory: true,
      coldStorage: true,
      procurement: true,
      pos: false,
      stockOpname: true,
      reports: false,
      notifications: true,
      settings: false,
      approvals: false,
    },
    CASHIER: {
      dashboard: true,
      inventory: true,
      coldStorage: false,
      procurement: false,
      pos: true,
      stockOpname: false,
      reports: false,
      notifications: true,
      settings: false,
      approvals: false,
    },
    VIEWER: {
      dashboard: true,
      inventory: true,
      coldStorage: true,
      procurement: false,
      pos: false,
      stockOpname: false,
      reports: true,
      notifications: true,
      settings: false,
      approvals: false,
    },
  }

  return access[role as keyof typeof access] || access.VIEWER
}
