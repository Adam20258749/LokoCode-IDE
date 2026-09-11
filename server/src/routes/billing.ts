import { Router } from 'express'
import { prisma } from '../db.js'
import { getUserFromRequest } from '../auth.js'

const router = Router()

const PLANS = [
  { id: 'free', name: 'Free', price: 0, features: ['Full code editor', 'Personal workspace', '1 GB cloud storage', 'Basic Git', '50 AI requests/mo', 'Community extensions'] },
  { id: 'pro', name: 'Pro', price: 19, features: ['Everything in Free', '50 GB cloud storage', 'Advanced AI agents', 'Multiple VMs', 'Private projects', 'Advanced Git features', 'Remote development'] },
  { id: 'team', name: 'Team', price: 49, features: ['Everything in Pro', 'Organization workspaces', 'Team collaboration', 'Member management', 'Shared AI agents', 'Audit logs', 'Team billing'] },
  { id: 'business', name: 'Business', price: 99, features: ['Everything in Team', 'SSO', 'Advanced security', 'Dedicated environments', 'Priority support', 'Centralized billing', 'Enterprise controls'] },
]

router.get('/plans', (_req, res) => {
  res.json(PLANS)
})

router.get('/current', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ plan: user.plan, status: 'active' })
})

router.post('/upgrade', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const { planId } = req.body as { planId: string }
  const plan = PLANS.find(p => p.id === planId)
  if (!plan) return res.status(400).json({ error: 'Invalid plan' })

  // In production, this would create a Stripe Checkout session
  // For now, update the user's plan directly
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { plan: planId },
  })
  res.json({ plan: updated.plan, status: 'active' })
})

router.get('/usage', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const projectCount = await prisma.project.count({ where: { ownerId: user.id } })
  const fileCount = await prisma.file.count({
    where: { project: { ownerId: user.id } },
  })
  const workspaceCount = await prisma.workspace.count({ where: { ownerId: user.id } })
  const aiConversations = await prisma.aiConversation.count({ where: { userId: user.id } })
  res.json({
    projects: projectCount,
    files: fileCount,
    workspaces: workspaceCount,
    aiConversations,
    storage: { used: fileCount * 4 * 1024, limit: user.plan === 'free' ? 1e9 : 50e9 },
    ai: { used: aiConversations * 12, limit: user.plan === 'free' ? 50 : 5000 },
  })
})

export default router
