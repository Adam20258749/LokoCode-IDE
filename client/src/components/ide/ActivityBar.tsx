import { useEditor } from '../../store/editor'
import { useNavigate } from 'react-router-dom'
import { Files, Search, GitBranch, Bug, Blocks, Container, Database, Sparkles, Settings } from 'lucide-react'

export default function ActivityBar() {
  const { sidebarView, setSidebarView, toggleAiPanel, aiPanelOpen } = useEditor()
  const navigate = useNavigate()

  const items = [
    { id: 'explorer', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'git', icon: GitBranch, label: 'Source Control' },
    { id: 'debug', icon: Bug, label: 'Run & Debug' },
    { id: 'extensions', icon: Blocks, label: 'Extensions' },
    { id: 'docker', icon: Container, label: 'Docker' },
    { id: 'database', icon: Database, label: 'Database' },
  ] as const

  return (
    <div className="w-12 bg-2 border-r border-app flex flex-col items-center py-2 flex-shrink-0">
      {items.map(item => (
        <button
          key={item.id}
          className={`sidebar-icon ${sidebarView === item.id ? 'active' : ''}`}
          onClick={() => setSidebarView(item.id)}
          title={item.label}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}
      <div className="flex-1" />
      <button
        className={`sidebar-icon ${aiPanelOpen ? 'active' : ''}`}
        onClick={toggleAiPanel}
        title="AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>
      <button className="sidebar-icon" onClick={() => navigate('/settings')} title="Settings">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  )
}
