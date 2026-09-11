import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './db.js'

const SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me'

export function signToken(userId: string) {
  return jwt.sign({ id: userId }, SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, SECRET) as { id: string }
  } catch {
    return null
  }
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10)
}

export async function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash)
}

export async function getUserFromRequest(req: any) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  const payload = verifyToken(auth.slice(7))
  if (!payload) return null
  return prisma.user.findUnique({ where: { id: payload.id } })
}
