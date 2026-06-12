import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { ROLE_ACCESS_MAP } from '@/lib/constants'
import type { RoleAccessMap } from '@/types'

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

/**
 * Returns the access permissions for a given role.
 * Delegates to ROLE_ACCESS_MAP in constants — single source of truth.
 * Falls back to VIEWER permissions for unknown roles.
 */
export function getRoleAccess(role: string): RoleAccessMap {
  return ROLE_ACCESS_MAP[role] ?? ROLE_ACCESS_MAP.VIEWER
}

