import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../store/auth'
import { useTheme } from '../store/theme'
import {
  Code2, Plus, FolderOpen, Download, GitBranch, Monitor, Sparkles,
  Search, Settings, Moon, Sun, LogOut, Clock, HardDrive, User as UserIcon,
  ChevronRight, Zap, FileCode, Boxes, Rocket
} from 'lucide-react'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'react', 'html', 'css', 'go', 'rust', 'java', 'cpp', 'c'
]

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLang, setNewLang] = useState('javascript')
  const [aiPrompt, setAiPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const [ps, ws] = await Promise.all([api.getProjects(), api.getWorkspaces()])
      setProjects(ps)
      setWorkspaces(ws)
    } catch { /* ignore */ }
    setLoading(false)
  }
  useEffect(() => { loadData() }, [])

  const createProject = async () => {
    if (!newName.trim()) return
    try {
      const p = await api.createProject(newName, newLang)
      setShowNew(false)
      setNewName('')
      navigate(`/ide/${p.id}`)
    } catch (e: any) {
      alert(e.message)
    }
  }

  const buildWithAI = () => {
    if (!aiPrompt.trim()) return
    // Create a project from AI prompt
    const name = aiPrompt.slice(0, 30).replace(/\s+/g, '-').toLowerCase() || 'ai-project'
    api.createProject(name, 'react').then(p => navigate(`/ide/${p.id}`)).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Top Bar */}
      <header className="border-b border-app bg-2 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-main">LokoCode IDE</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/vms')} className="btn-ghost"><Monitor className="w-4 h-4" /> VMs</button>
            <button onClick={() => navigate('/billing')} className="btn-ghost"><Rocket className="w-4 h-4" /> Billing</button>
            <button onClick={() => navigate('/settings')} className="btn-ghost"><Settings className="w-4 h-4" /></button>
            <button onClick={toggle} className="btn-ghost">{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <div className="w-px h-6 bg-app" />
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-main hidden sm:block">{user?.username}</span>
            </div>
            <button onClick={() => { logout(); navigate('/auth') }} className="btn-ghost"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Create with AI */}
        <section className="mb-10">
          <div className="card p-6 bg-gradient-to-br from-brand-600/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-semibold text-main">Create with AI</h2>
            </div>
            <p className="text-2 text-sm mb-4">Describe what you want to build and LokoCode AI will plan and generate it.</p>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="e.g. Create a task-management app with authentication, teams, and a dashboard"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buildWithAI()}
              />
              <button onClick={buildWithAI} className="btn-primary"><Zap className="w-4 h-4" /> Build</button>
              <button className="btn-outline">Advanced</button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button onClick={() => setShowNew(true)} className="card p-4 hover:border-brand-500 transition-colors text-left">
              <Plus className="w-5 h-5 text-brand-500 mb-2" />
              <div className="text-sm font-medium text-main">New Project</div>
            </button>
            <button className="card p-4 hover:border-brand-500 transition-colors text-left">
              <FolderOpen className="w-5 h-5 text-2 mb-2" />
              <div className="text-sm font-medium text-main">Open Project</div>
            </button>
            <button className="card p-4 hover:border-brand-500 transition-colors text-left">
              <Download className="w-5 h-5 text-2 mb-2" />
              <div className="text-sm font-medium text-main">Import</div>
            </button>
            <button className="card p-4 hover:border-brand-500 transition-colors text-left">
              <GitBranch className="w-5 h-5 text-2 mb-2" />
              <div className="text-sm font-medium text-main">Clone Repo</div>
            </button>
            <button onClick={() => navigate('/vms')} className="card p-4 hover:border-brand-500 transition-colors text-left">
              <Monitor className="w-5 h-5 text-2 mb-2" />
              <div className="text-sm font-medium text-main">Open VM</div>
            </button>
            <button className="card p-4 hover:border-brand-500 transition-colors text-left">
              <Sparkles className="w-5 h-5 text-2 mb-2" />
              <div className="text-sm font-medium text-main">Ask AI</div>
            </button>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Workspaces */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-2 uppercase tracking-wide mb-3">My Workspaces</h3>
            <div className="space-y-2">
              {workspaces.map(ws => (
                <div key={ws.id} className="card p-3 flex items-center gap-3 hover:border-brand-500 transition-colors cursor-pointer">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ws.type === 'personal' ? 'bg-brand-600/20' : 'bg-purple-600/20'}`}>
                    {ws.type === 'personal' ? <UserIcon className="w-4 h-4 text-brand-500" /> : <Boxes className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-main truncate">{ws.name}</div>
                    <div className="text-xs text-3">{ws.projects?.length || 0} projects</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-2 uppercase tracking-wide mb-3">Recent Projects</h3>
            {loading ? (
              <div className="text-2 text-sm py-8 text-center">Loading…</div>
            ) : projects.length === 0 ? (
              <div className="card p-8 text-center">
                <FileCode className="w-10 h-10 text-3 mx-auto mb-3" />
                <p className="text-2 text-sm mb-4">No projects yet. Create one to get started.</p>
                <button onClick={() => setShowNew(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Project</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {projects.map(p => (
                  <div key={p.id} onClick={() => navigate(`/ide/${p.id}`)} className="card p-4 hover:border-brand-500 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-brand-500" />
                        <span className="text-sm font-medium text-main">{p.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-3 text-2">{p.language}</span>
                    </div>
                    <div className="space-y-1 text-xs text-3">
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(p.lastModified).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> {p.owner?.username || user?.username}</div>
                      {p.gitRepo && <div className="flex items-center gap-1.5"><GitBranch className="w-3 h-3" /> {p.gitRepo}</div>}
                      <div className="flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> {(p.storageUsed / 1024).toFixed(0)} KB</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowNew(false)}>
          <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-main mb-4">New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-2 mb-1.5 block">Project Name</label>
                <input className="input" placeholder="my-awesome-project" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createProject()} autoFocus />
              </div>
              <div>
                <label className="text-xs text-2 mb-1.5 block">Language / Framework</label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setNewLang(lang)}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${newLang === lang ? 'border-brand-500 bg-brand-600/10 text-brand-500' : 'border-app text-2 hover:text-main'}`}
                    >{lang}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
                <button onClick={createProject} className="btn-primary"><Plus className="w-4 h-4" /> Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
