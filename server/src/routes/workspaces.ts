import { Router } from 'express'
import { prisma } from '../db.js'
import { getUserFromRequest } from '../auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id },
    include: { projects: true },
  })
  res.json(workspaces)
})

router.post('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const { name, type = 'personal' } = req.body as { name: string; type?: string }
  if (!name) return res.status(400).json({ error: 'Name required' })
  const ws = await prisma.workspace.create({
    data: { name, type, ownerId: user.id },
  })
  res.json(ws)
})

export default router
