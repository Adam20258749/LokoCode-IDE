import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import workspaceRoutes from './routes/workspaces.js'
import projectRoutes from './routes/projects.js'
import fileRoutes from './routes/files.js'
import aiRoutes from './routes/ai.js'
import billingRoutes from './routes/billing.js'
import vmRoutes from './routes/vms.js'
import apiKeyRoutes from './routes/apikeys.js'

const app = express()

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', name: 'LokoCode IDE API' }))

app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/vms', vmRoutes)
app.use('/api/apikeys', apiKeyRoutes)

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LokoCode API running on port ${PORT}`)
})
