import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../store/auth'
import { useTheme } from '../store/theme'
import {
  Code2, ArrowLeft, User, Palette, Keyboard, Bot, Key, Monitor,
  GitBranch, Container, Database, Cloud, Shield, Bell, Lock,
  Sun, Moon, Check, Trash2, Plus
} from 'lucide-react'

export default function SettingsPage() {
  const [section, setSection] = useState('account')
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newProvider, setNewProvider] = useState('')
  const [newKey, setNewKey] = useState('')
  const { user } = useAuth()
  const { theme, set } = useTheme()
  const navigate = useNavigate()

  useEffect(() => { api.getApiKeys().then(setApiKeys).catch(() => {}) }, [])

  const addKey = async () => {
    if (!newProvider || !newKey) return
    await api.addApiKey(newProvider, newKey)
    setNewProvider('')
    setNewKey('')
    api.getApiKeys().then(setApiKeys)
  }

  const removeKey = async (id: string) => {
    await api.deleteApiKey(id)
    api.getApiKeys().then(setApiKeys)
  }

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'vms', label: 'VMs', icon: Monitor },
    { id: 'git', label: 'Git', icon: GitBranch },
    { id: 'docker', label: 'Docker', icon: Container },
    { id: 'databases', label: 'Databases', icon: Database },
    { id: 'cloud', label: 'Cloud', icon: Cloud },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'billing', label: 'Billing', icon: Cloud },
  ]

  return (
    <div className="min-h-screen bg-app">
      <header className="h-14 bg-2 border-b border-app flex items-center px-4 gap-4">
        <button onClick={() => navigate('/dashboard')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-brand-500" />
          <span className="font-semibold text-main">Settings</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="space-y-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  section === s.id ? 'bg-brand-600/10 text-brand-500' : 'text-2 hover:text-main hover:bg-3'
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-main">Account</h2>
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-medium">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-main font-medium">{user?.username}</div>
                    <div className="text-2 text-sm">{user?.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-2">Username</label><input className="input mt-1" defaultValue={user?.username} /></div>
                  <div><label className="text-xs text-2">Email</label><input className="input mt-1" defaultValue={user?.email} /></div>
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
              <div className="card p-6">
                <h3 className="text-sm font-medium text-main mb-3">Subscription</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2 text-sm">Current plan: </span>
                    <span className="text-main font-medium capitalize">{user?.plan}</span>
                  </div>
                  <button onClick={() => navigate('/billing')} className="btn-outline">Manage</button>
                </div>
              </div>
            </div>
          )}

          {section === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-main">Appearance</h2>
              <div className="card p-6">
                <h3 className="text-sm font-medium text-main mb-4">Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[{ id: 'dark', label: 'Dark', icon: Moon }, { id: 'light', label: 'Light', icon: Sun }].map(t => (
                    <button
                      key={t.id}
                      onClick={() => set(t.id as any)}
                      className={`card p-4 flex items-center gap-3 ${theme === t.id ? 'border-brand-500' : ''}`}
                    >
                      <t.icon className="w-5 h-5 text-2" />
                      <span className="text-sm text-main">{t.label}</span>
                      {theme === t.id && <Check className="w-4 h-4 text-brand-500 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-sm font-medium text-main mb-4">Editor Font Size</h3>
                <input type="range" min="10" max="24" defaultValue="14" className="w-full" />
                <div className="text-xs text-3 mt-1">14px</div>
              </div>
            </div>
          )}

          {section === 'keyboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-main">Keyboard Shortcuts</h2>
              <div className="card p-6 space-y-3">
                {[
                  { keys: 'Ctrl+Shift+P', action: 'Command Palette' },
                  { keys: 'Ctrl+S', action: 'Save File' },
                  { keys: 'Ctrl+B', action: 'Toggle Sidebar' },
                  { keys: 'Ctrl+`', action: 'Toggle Terminal' },
                  { keys: 'Ctrl+/', action: 'Toggle Comment' },
                  { keys: 'Ctrl+F', action: 'Find' },
                  { keys: 'Ctrl+H', action: 'Replace' },
                  { keys: 'Ctrl+Shift+K', action: 'Delete Line' },
                ].map(s => (
                  <div key={s.keys} className="flex items-center justify-between py-2 border-b border-app last:border-0">
                    <span className="text-sm text-2">{s.action}</span>
                    <kbd className="text-xs text-main bg-3 px-2 py-1 rounded">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-main">AI Settings</h2>
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-medium text-main">Model Selection</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-2">Chat Model</label><select className="input mt-1"><option>GPT-4o</option><option>Claude 3.5 Sonnet</option><option>Gemini Pro</option></select></div>
                  <div><label className="text-xs text-2">Coding Model</label><select className="input mt-1"><option>Claude 3.5 Sonnet</option><option>GPT-4o</option><option>DeepSeek Coder</option></select></div>
                  <div><label className="text-xs text-2">Agent Model</label><select className="input mt-1"><option>GPT-4o</option><option>Claude 3.5 Sonnet</option></select></div>
                  <div><label className="text-xs text-2">Fast Model</label><select className="input mt-1"><option>GPT-4o mini</option><option>Claude 3 Haiku</option></select></div>
                </div>
              </div>
              <div className="card p-6 space-y-3">
                <h3 className="text-sm font-medium text-main">Agent Permissions</h3>
                {['Allow file creation', 'Allow file modification', 'Allow running commands', 'Allow installing dependencies', 'Require approval for deletions'].map(p => (
                  <label key={p} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-2">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {section === 'apikeys' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-main">API Keys</h2>
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-medium text-main">Add API Key</h3>
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={newProvider} onChange={e => setNewProvider(e.target.value)}>
                    <option value="">Select provider…</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                    <option value="xai">xAI</option>
                    <option value="mistral">Mistral</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="custom">Custom</option>
                  </select>
                  <input className="input" placeholder="API key…" type="password" value={newKey} onChange={e => setNewKey(e.target.value)} />
                </div>
                <button onClick={addKey} className="btn-primary"><Plus className="w-4 h-4" /> Add Key</button>
              </div>
              <div className="card p-6">
                <h3 className="text-sm font-medium text-main mb-3">Connected Keys</h3>
                {apiKeys.length === 0 ? (
                  <p className="text-2 text-sm">No API keys connected. Add one to enable AI features.</p>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map(k => (
                      <div key={k.id} className="flex items-center justify-between py-2 border-b border-app last:border-0">
                        <div>
                          <span className="text-sm text-main capitalize">{k.provider}</span>
                          <span className="text-xs text-3 ml-2">{k.keyHint}</span>
                        </div>
                        <button onClick={() => removeKey(k.id)} className="text-2 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {section === 'vms' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-main">VM Settings</h2>
              <div className="card p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-2">Default CPU Cores</label><input type="number" className="input mt-1" defaultValue={2} /></div>
                  <div><label className="text-xs text-2">Default RAM (GB)</label><input type="number" className="input mt-1" defaultValue={4} /></div>
                  <div><label className="text-xs text-2">Default Disk (GB)</label><input type="number" className="input mt-1" defaultValue={20} /></div>
                  <div><label className="text-xs text-2">Network</label><select className="input mt-1"><option>Enabled</option><option>Disabled</option></select></div>
                </div>
                <button className="btn-primary">Save VM Defaults</button>
              </div>
            </div>
          )}

          {['git', 'docker', 'databases', 'cloud', 'security', 'notifications', 'privacy', 'billing'].includes(section) && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-main capitalize">{sections.find(s => s.id === section)?.label}</h2>
              <div className="card p-6">
                <p className="text-2 text-sm">Configure your {sections.find(s => s.id === section)?.label.toLowerCase()} settings here.</p>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-2">Enable {sections.find(s => s.id === section)?.label}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-2">Verbose logging</span>
                  </label>
                </div>
                <button className="btn-primary mt-4">Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
