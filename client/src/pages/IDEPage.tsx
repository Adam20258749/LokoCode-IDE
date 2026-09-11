import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useEditor, type FileNode } from '../store/editor'
import { useAuth } from '../store/auth'
import ActivityBar from '../components/ide/ActivityBar'
import Sidebar from '../components/ide/Sidebar'
import EditorArea from '../components/ide/EditorArea'
import BottomPanel from '../components/ide/BottomPanel'
import AIPanel from '../components/ide/AIPanel'
import StatusBar from '../components/ide/StatusBar'
import TopBar from '../components/ide/TopBar'

export default function IDEPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const setFiles = useEditor(s => s.setFiles)
  const openTab = useEditor(s => s.openTab)

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    api.getProject(projectId).then(p => {
      setProject(p)
      const files = p.files as any[]
      const tree = buildTree(files)
      setFiles(tree)
      // Auto-open the first code file
      const firstFile = files.find(f => f.type === 'file' && (f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.py') || f.name.endsWith('.jsx') || f.name.endsWith('.tsx') || f.name.endsWith('.html') || f.name.endsWith('.css') || f.name.endsWith('.md')))
      if (firstFile) {
        openTab({ id: firstFile.id, name: firstFile.name, path: firstFile.path, type: firstFile.type, content: firstFile.content }, getLanguage(firstFile.name))
      }
    }).catch(() => navigate('/dashboard')).finally(() => setLoading(false))
  }, [projectId])

  if (loading) return <div className="h-screen flex items-center justify-center bg-app text-2">Loading project…</div>
  if (!project) return null

  return (
    <div className="h-screen flex flex-col bg-app overflow-hidden">
      <TopBar project={project} />
      <div className="flex-1 flex min-h-0">
        <ActivityBar />
        <Sidebar projectId={project.id} />
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 flex flex-col min-w-0">
            <EditorArea projectId={project.id} />
            <BottomPanel projectId={project.id} />
          </div>
          <AIPanel projectId={project.id} />
        </div>
      </div>
      <StatusBar project={project} />
    </div>
  )
}

function buildTree(files: any[]): FileNode[] {
  const map = new Map<string, FileNode>()
  files.forEach(f => map.set(f.id, { ...f, children: [] }))
  const roots: FileNode[] = []
  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

export function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', html: 'html', css: 'css', json: 'json', md: 'markdown',
    go: 'go', rs: 'rust', java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp',
    rb: 'ruby', php: 'php', swift: 'swift', kt: 'kotlin', sql: 'sql',
    sh: 'shell', yml: 'yaml', yaml: 'yaml', xml: 'xml', scala: 'scala',
    lua: 'lua', r: 'r', dart: 'dart', solidity: 'solidity', pl: 'perl',
    pm: 'perl', asm: 'asm', s: 'asm',
  }
  return map[ext] || 'plaintext'
}
