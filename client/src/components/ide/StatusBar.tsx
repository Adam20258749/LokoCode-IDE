import { useEditor } from '../../store/editor'
import { getLanguage } from '../../pages/IDEPage'
import { Circle, GitBranch, Bell, Check, Wifi } from 'lucide-react'

export default function StatusBar({ project }: { project: any }) {
  const { activeTabId, tabs } = useEditor()
  const activeTab = tabs.find(t => t.fileId === activeTabId)
  const lang = activeTab ? activeTab.language : project.language

  return (
    <footer className="h-6 bg-brand-600 text-white flex items-center px-3 text-xs gap-4 flex-shrink-0">
      <div className="flex items-center gap-1">
        <GitBranch className="w-3 h-3" /> main
      </div>
      <div className="flex items-center gap-1">
        <Circle className="w-2 h-2 fill-green-400 text-green-400" /> Ready
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span>{lang}</span>
        <span>UTF-8</span>
        <span>LF</span>
        {activeTab && <span>Ln 1, Col 1</span>}
        <span>Spaces: 2</span>
        <Check className="w-3 h-3" />
        <Bell className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
      </div>
    </footer>
  )
}
