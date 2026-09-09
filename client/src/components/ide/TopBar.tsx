import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useTheme } from '../../store/theme'
import { Code2, GitBranch, Play, Sparkles, Moon, Sun, LogOut, Save, Cloud } from 'lucide-react'
import { useState } from 'react'

export default function TopBar({ project }: { project: any }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [saving, setSaving] = useState(false)

  const saveAll = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1500)
  }

  return (
    <header className="h-11 bg-2 border-b border-app flex items-center px-3 gap-2 flex-shrink-0">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 hover:opacity-80">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <Code2 className="w-4 h-4 text-white" />
        </div>
      </button>
      <div className="w-px h-5 bg-app" />
      <button onClick={() => navigate('/dashboard')} className="text-sm text-2 hover:text-main px-2 py-1 rounded hover:bg-3 transition-colors">
        {project.name}
      </button>
      <span className="text-3 text-xs">›</span>
      <span className="text-sm text-3">{project.language}</span>

      <div className="flex-1" />

      <button className="btn-ghost text-xs"><GitBranch className="w-3.5 h-3.5" /> main</button>
      <button onClick={saveAll} className="btn-ghost text-xs">
        {saving ? <Cloud className="w-3.5 h-3.5 text-green-500" /> : <Save className="w-3.5 h-3.5" />}
        {saving ? 'Saved to cloud ✓' : 'Save'}
      </button>
      <button className="btn-ghost text-xs"><Sparkles className="w-3.5 h-3.5" /> AI</button>
      <button className="btn-primary text-xs"><Play className="w-3.5 h-3.5" /> Run</button>

      <div className="w-px h-5 bg-app" />
      <button onClick={toggle} className="btn-ghost">{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-medium">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
      <button onClick={() => { logout(); navigate('/auth') }} className="btn-ghost"><LogOut className="w-4 h-4" /></button>
    </header>
  )
}
