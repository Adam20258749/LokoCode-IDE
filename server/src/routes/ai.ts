import { Router } from 'express'
import { prisma } from '../db.js'
import { getUserFromRequest } from '../auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const convs = await prisma.aiConversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  })
  res.json(convs)
})

router.post('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const { title = 'New Chat' } = req.body as any
  const conv = await prisma.aiConversation.create({
    data: { userId: user.id, title },
  })
  res.json(conv)
})

router.get('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const conv = await prisma.aiConversation.findUnique({ where: { id: req.params.id } })
  if (!conv || conv.userId !== user.id) return res.status(404).json({ error: 'Not found' })
  res.json(conv)
})

router.post('/:id/message', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const conv = await prisma.aiConversation.findUnique({ where: { id: req.params.id } })
  if (!conv || conv.userId !== user.id) return res.status(404).json({ error: 'Not found' })

  const { role, content } = req.body as { role: string; content: string }
  const messages = (conv.messages as any[]) || []
  messages.push({ role, content, timestamp: new Date().toISOString() })
  const updated = await prisma.aiConversation.update({
    where: { id: conv.id },
    data: { messages, updatedAt: new Date() },
  })
  res.json(updated)
})

router.delete('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const conv = await prisma.aiConversation.findUnique({ where: { id: req.params.id } })
  if (!conv || conv.userId !== user.id) return res.status(404).json({ error: 'Not found' })
  await prisma.aiConversation.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
