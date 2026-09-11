import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../store/auth'
import { Code2, ArrowLeft, Check, Zap, Users, Building, Sparkles, TrendingUp, HardDrive, Cpu, Activity } from 'lucide-react'

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [currentPlan, setCurrentPlan] = useState('free')
  const [usage, setUsage] = useState<any>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.getPlans().then(setPlans)
    api.getCurrentPlan().then(p => setCurrentPlan(p.plan))
    api.getUsage().then(setUsage).catch(() => {})
  }, [])

  const upgrade = async (planId: string) => {
    if (planId === currentPlan) return
    await api.upgradePlan(planId)
    setCurrentPlan(planId)
  }

  const planIcons: Record<string, any> = { free: Sparkles, pro: Zap, team: Users, business: Building }

  return (
    <div className="min-h-screen bg-app">
      <header className="h-14 bg-2 border-b border-app flex items-center px-4 gap-4">
        <button onClick={() => navigate('/dashboard')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-brand-500" />
          <span className="font-semibold text-main">Billing & Subscription</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Current Plan */}
        <div className="card p-6 mb-8 bg-gradient-to-br from-brand-600/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2 text-sm mb-1">Current Plan</div>
              <div className="text-2xl font-bold text-main capitalize">{currentPlan}</div>
              <div className="text-3 text-sm mt-1">
                {currentPlan === 'free' ? 'Free forever' : `$${plans.find(p => p.id === currentPlan)?.price || 0}/month`}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline">Manage Subscription</button>
              {currentPlan !== 'free' && <button className="btn-ghost text-red-500">Cancel</button>}
            </div>
          </div>
        </div>

        {/* Usage */}
        {usage && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Projects', value: usage.projects, icon: Code2, color: 'text-brand-500' },
              { label: 'Files', value: usage.files, icon: HardDrive, color: 'text-green-500' },
              { label: 'AI Chats', value: usage.aiConversations, icon: Sparkles, color: 'text-purple-500' },
              { label: 'Workspaces', value: usage.workspaces, icon: Building, color: 'text-orange-500' },
            ].map(stat => (
              <div key={stat.label} className="card p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-main">{stat.value}</div>
                <div className="text-xs text-3">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Storage & AI Usage */}
        {usage && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="w-4 h-4 text-2" />
                <span className="text-sm font-medium text-main">Storage Usage</span>
              </div>
              <div className="h-2 bg-3 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, (usage.storage.used / usage.storage.limit) * 100)}%` }} />
              </div>
              <div className="text-xs text-3">{(usage.storage.used / 1024 / 1024).toFixed(1)} MB / {(usage.storage.limit / 1024 / 1024 / 1024).toFixed(0)} GB</div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-2" />
                <span className="text-sm font-medium text-main">AI Usage</span>
              </div>
              <div className="h-2 bg-3 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (usage.ai.used / usage.ai.limit) * 100)}%` }} />
              </div>
              <div className="text-xs text-3">{usage.ai.used} / {usage.ai.limit} requests</div>
            </div>
          </div>
        )}

        {/* Plans */}
        <h2 className="text-lg font-semibold text-main mb-4">Available Plans</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => {
            const Icon = planIcons[plan.id] || Sparkles
            const isCurrent = plan.id === currentPlan
            return (
              <div key={plan.id} className={`card p-5 flex flex-col ${isCurrent ? 'border-brand-500' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-brand-500" />
                  <span className="font-semibold text-main">{plan.name}</span>
                  {isCurrent && <span className="text-xs px-2 py-0.5 rounded bg-brand-600/20 text-brand-500 ml-auto">Current</span>}
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-main">${plan.price}</span>
                  <span className="text-2 text-sm">/mo</span>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => upgrade(plan.id)}
                  disabled={isCurrent}
                  className={isCurrent ? 'btn-outline w-full justify-center cursor-default' : 'btn-primary w-full justify-center'}
                >
                  {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Billing History */}
        <h2 className="text-lg font-semibold text-main mt-8 mb-4">Billing History</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-3 text-2 text-xs uppercase">
              <tr><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Description</th><th className="text-right px-4 py-3">Amount</th><th className="text-right px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              <tr className="border-t border-app"><td className="px-4 py-3 text-2">—</td><td className="px-4 py-3 text-2">No transactions yet</td><td className="px-4 py-3 text-2 text-right">—</td><td className="px-4 py-3 text-right text-green-500">—</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
