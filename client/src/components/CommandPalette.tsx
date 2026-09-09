import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditor } from '../store/editor'
import { useTheme } from '../store/theme'
import { useAuth } from '../store/auth'
import { Search, ArrowRight } from 'lucide-react'

interface Command {
  id: string
  label: string
  category: string
  action: () => void
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { toggleAiPanel, toggleBottomPanel, setSidebarView } = useEditor()
  const { toggle } = useTheme()
  const { logout } = useAuth()

  useEffect(() => {
    const handler = () => { setOpen(true); setQuery(''); setSelected(0) }
    window.addEventListener('lokocode:command-palette', handler)
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', escHandler)
    return () => {
      window.removeEventListener('lokocode:command-palette', handler)
      window.removeEventListener('keydown', escHandler)
    }
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const commands: Command[] = [
    { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', action: () => navigate('/dashboard') },
    { id: 'settings', label: 'Open Settings', category: 'Navigation', action: () => navigate('/settings') },
    { id: 'billing', label: 'Open Billing', category: 'Navigation', action: () => navigate('/billing') },
    { id: 'vms', label: 'Open VM Dashboard', category: 'Navigation', action: () => navigate('/vms') },
    { id: 'explorer', label: 'Show Explorer', category: 'View', action: () => setSidebarView('explorer') },
    { id: 'search', label: 'Show Search', category: 'View', action: () => setSidebarView('search') },
    { id: 'git', label: 'Show Source Control', category: 'View', action: () => setSidebarView('git') },
    { id: 'debug', label: 'Show Run & Debug', category: 'View', action: () => setSidebarView('debug') },
    { id: 'extensions', label: 'Show Extensions', category: 'View', action: () => setSidebarView('extensions') },
    { id: 'docker', label: 'Show Docker', category: 'View', action: () => setSidebarView('docker') },
    { id: 'database', label: 'Show Database', category: 'View', action: () => setSidebarView('database') },
    { id: 'toggle-ai', label: 'Toggle AI Panel', category: 'View', action: () => toggleAiPanel() },
    { id: 'toggle-terminal', label: 'Toggle Terminal', category: 'View', action: () => toggleBottomPanel() },
    { id: 'toggle-theme', label: 'Toggle Dark/Light Mode', category: 'Preferences', action: () => toggle() },
    { id: 'logout', label: 'Sign Out', category: 'Account', action: () => { logout(); navigate('/auth') } },
  ]

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  )

  const run = (cmd?: Command) => {
    const c = cmd || filtered[selected]
    if (!c) return
    c.action()
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-xl card shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-app">
          <Search className="w-4 h-4 text-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-sm text-main"
            placeholder="Type a command…"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
              if (e.key === 'Enter') run()
            }}
          />
          <kbd className="text-xs text-3 px-1.5 py-0.5 rounded bg-3">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => run(cmd)}
              onMouseEnter={() => setSelected(i)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left ${i === selected ? 'bg-brand-600/10' : ''}`}
            >
              <span className="text-xs text-3 w-20 flex-shrink-0">{cmd.category}</span>
              <span className="text-sm text-main flex-1">{cmd.label}</span>
              {i === selected && <ArrowRight className="w-4 h-4 text-brand-500" />}
            </button>
          ))}
          {filtered.length === 0 && <div className="px-4 py-3 text-sm text-3">No commands found.</div>}
        </div>
      </div>
    </div>
  )
}
