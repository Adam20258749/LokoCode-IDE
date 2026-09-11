import { Router } from 'express'
import { prisma } from '../db.js'
import { getUserFromRequest } from '../auth.js'

const router = Router()

router.get('/:projectId', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const project = await prisma.project.findUnique({ where: { id: req.params.projectId } })
  if (!project || project.ownerId !== user.id) return res.status(404).json({ error: 'Not found' })
  const files = await prisma.file.findMany({
    where: { projectId: req.params.projectId },
    orderBy: [{ type: 'desc' }, { name: 'asc' }],
  })
  res.json(files)
})

router.post('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const { projectId, name, parentId, type = 'file', content = '' } = req.body as any
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || project.ownerId !== user.id) return res.status(404).json({ error: 'Not found' })

  const parent = parentId
    ? await prisma.file.findUnique({ where: { id: parentId } })
    : null
  const path = parent ? `${parent.path}/${name}` : name

  const file = await prisma.file.create({
    data: { name, path, content, type, parentId: parentId || null, projectId },
  })
  await prisma.project.update({ where: { id: projectId }, data: { lastModified: new Date() } })
  res.json(file)
})

router.patch('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const file = await prisma.file.findUnique({ where: { id: req.params.id } })
  if (!file) return res.status(404).json({ error: 'Not found' })
  const project = await prisma.project.findUnique({ where: { id: file.projectId } })
  if (!project || project.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

  const { content, name } = req.body as any
  const updated = await prisma.file.update({
    where: { id: req.params.id },
    data: {
      ...(content !== undefined && { content }),
      ...(name && { name, path: file.path.replace(/[^/]+$/, name) }),
    },
  })
  await prisma.project.update({ where: { id: file.projectId }, data: { lastModified: new Date() } })
  res.json(updated)
})

router.delete('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const file = await prisma.file.findUnique({ where: { id: req.params.id } })
  if (!file) return res.status(404).json({ error: 'Not found' })
  const project = await prisma.project.findUnique({ where: { id: file.projectId } })
  if (!project || project.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

  await prisma.file.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
