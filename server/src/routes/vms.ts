import { Router } from 'express'
import { getUserFromRequest } from '../auth.js'

const router = Router()

// In-memory VM store (in production this would be backed by a VM orchestration service)
const vms: Record<string, any> = {}

router.get('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const userVMs = Object.values(vms).filter((v: any) => v.ownerId === user.id)
  res.json(userVMs)
})

router.post('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const { name, os = 'ubuntu', cpu = 2, ram = 4, disk = 20 } = req.body as any
  if (!name) return res.status(400).json({ error: 'VM name required' })

  const id = `vm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const vm = {
    id,
    name,
    os,
    cpu,
    ram,
    disk,
    network: 'enabled',
    status: 'stopped',
    ownerId: user.id,
    createdAt: new Date().toISOString(),
  }
  vms[id] = vm
  res.json(vm)
})

router.patch('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const vm = vms[req.params.id]
  if (!vm || vm.ownerId !== user.id) return res.status(404).json({ error: 'VM not found' })
  const { action } = req.body as { action: string }
  if (['start', 'stop', 'restart', 'pause'].includes(action)) {
    const statusMap: Record<string, string> = { start: 'running', stop: 'stopped', restart: 'running', pause: 'paused' }
    vm.status = statusMap[action]
    res.json(vm)
  } else {
    res.status(400).json({ error: 'Invalid action' })
  }
})

router.delete('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const vm = vms[req.params.id]
  if (!vm || vm.ownerId !== user.id) return res.status(404).json({ error: 'VM not found' })
  delete vms[req.params.id]
  res.json({ ok: true })
})

export default router
