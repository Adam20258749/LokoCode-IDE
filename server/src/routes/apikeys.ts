import { Router } from 'express'
import { prisma } from '../db.js'
import { getUserFromRequest } from '../auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, provider: true, keyHint: true, createdAt: true },
  })
  res.json(keys)
})

router.post('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const { provider, apiKey } = req.body as { provider: string; apiKey: string }
  if (!provider || !apiKey) return res.status(400).json({ error: 'Provider and API key required' })

  // In production, encrypt the key before storing. We only store a hint.
  const keyHint = apiKey.slice(0, 4) + '...' + apiKey.slice(-4)
  const existing = await prisma.apiKey.findFirst({ where: { userId: user.id, provider } })
  if (existing) {
    const updated = await prisma.apiKey.update({ where: { id: existing.id }, data: { keyHint } })
    res.json(updated)
  } else {
    const created = await prisma.apiKey.create({
      data: { provider, keyHint, userId: user.id },
    })
    res.json(created)
  }
})

router.delete('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const key = await prisma.apiKey.findUnique({ where: { id: req.params.id } })
  if (!key || key.userId !== user.id) return res.status(404).json({ error: 'Not found' })
  await prisma.apiKey.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
