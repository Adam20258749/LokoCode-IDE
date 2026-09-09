import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { signToken, hashPassword, comparePassword } from '../auth.js'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(40),
  password: z.string().min(6),
})

router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = registerSchema.parse(req.body)
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) return res.status(409).json({ error: 'Email or username already in use' })

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: await hashPassword(password),
      },
    })
    // Create personal workspace
    await prisma.workspace.create({
      data: { name: 'Personal', type: 'personal', ownerId: user.id },
    })

    const token = signToken(user.id)
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar, plan: user.plan },
    })
  } catch (e: any) {
    res.status(400).json({ error: e.errors?.[0]?.message || e.message })
  }
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await comparePassword(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user.id)
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar, plan: user.plan },
    })
  } catch (e: any) {
    res.status(400).json({ error: e.errors?.[0]?.message || e.message })
  }
})

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  const { verifyToken } = await import('../auth.js')
  const payload = verifyToken(auth.slice(7))
  if (!payload) return res.status(401).json({ error: 'Invalid token' })
  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user) return res.status(401).json({ error: 'User not found' })
  res.json({ id: user.id, email: user.email, username: user.username, avatar: user.avatar, plan: user.plan, role: user.role })
})

export default router
