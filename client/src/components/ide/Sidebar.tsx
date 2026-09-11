import { useState } from 'react'
import { useEditor, type FileNode } from '../../store/editor'
import { api } from '../../lib/api'
import { getLanguage } from '../../pages/IDEPage'
import {
  ChevronRight, ChevronDown, File as FileIcon, Folder, FolderOpen,
  Plus, FilePlus, FolderPlus, Search, GitBranch, Bug, Blocks, Container,
  Database, RefreshCw, Trash2, MoreHorizontal
} from 'lucide-react'

export default function Sidebar({ projectId }: { projectId: string }) {
  const { sidebarView, files, setFiles, openTab } = useEditor()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState<{ parentId: string | null; type: string } | null>(null)
  const [newName, setNewName] = useState('')

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const refresh = async () => {
    const filesData = await api.getFiles(projectId)
    const tree = buildTree(filesData)
    setFiles(tree)
  }

  const createItem = async () => {
    if (!newName.trim() || !creating) return
    try {
      await api.createFile({
        projectId,
        name: newName,
        parentId: creating.parentId,
        type: creating.type,
        content: '',
      })
      setNewName('')
      setCreating(null)
      await refresh()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const deleteItem = async (fileId: string) => {
    if (!confirm('Delete this item?')) return
    await api.deleteFile(fileId)
    await refresh()
  }

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isFolder = node.type === 'folder'
    const isExpanded = expanded.has(node.id)

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-1 px-2 py-1 hover:bg-3 cursor-pointer text-sm group"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => isFolder ? toggleExpand(node.id) : openTab(node, getLanguage(node.name))}
        >
          {isFolder ? (
            <>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-3 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-3 flex-shrink-0" />}
              {isExpanded ? <FolderOpen className="w-4 h-4 text-brand-500 flex-shrink-0" /> : <Folder className="w-4 h-4 text-brand-500 flex-shrink-0" />}
            </>
          ) : (
            <>
              <span className="w-3.5 flex-shrink-0" />
              <FileIcon className="w-4 h-4 text-3 flex-shrink-0" />
            </>
          )}
          <span className="text-main truncate flex-1">{node.name}</span>
          <div className="hidden group-hover:flex items-center gap-0.5">
            {isFolder && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setCreating({ parentId: node.id, type: 'file' }); }} className="p-0.5 hover:text-main" title="New File">
                  <FilePlus className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setCreating({ parentId: node.id, type: 'folder' }); }} className="p-0.5 hover:text-main" title="New Folder">
                  <FolderPlus className="w-3 h-3" />
                </button>
              </>
            )}
            <button onClick={(e) => { e.stopPropagation(); deleteItem(node.id); }} className="p-0.5 hover:text-red-500" title="Delete">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        {isFolder && isExpanded && (
          <>
            {node.children?.map(child => renderNode(child, depth + 1))}
            {creating?.parentId === node.id && (
              <NewItemInput depth={depth + 1} name={newName} setName={setNewName} onCreate={createItem} onCancel={() => setCreating(null)} type={creating.type} />
            )}
          </>
        )}
      </div>
    )
  }

  const titleMap: Record<string, { label: string; icon: any }> = {
    explorer: { label: 'EXPLORER', icon: null },
    search: { label: 'SEARCH', icon: Search },
    git: { label: 'SOURCE CONTROL', icon: GitBranch },
    debug: { label: 'RUN & DEBUG', icon: Bug },
    extensions: { label: 'EXTENSIONS', icon: Blocks },
    docker: { label: 'DOCKER', icon: Container },
    database: { label: 'DATABASE', icon: Database },
  }
  const title = titleMap[sidebarView]

  return (
    <div className="w-60 bg-2 border-r border-app flex flex-col flex-shrink-0">
      <div className="h-9 flex items-center justify-between px-3 border-b border-app">
        <span className="text-xs font-semibold text-2 tracking-wide">{title.label}</span>
        {sidebarView === 'explorer' && (
          <div className="flex items-center gap-1">
            <button onClick={() => setCreating({ parentId: null, type: 'file' })} className="p-1 hover:bg-3 rounded" title="New File"><FilePlus className="w-3.5 h-3.5 text-2" /></button>
            <button onClick={() => setCreating({ parentId: null, type: 'folder' })} className="p-1 hover:bg-3 rounded" title="New Folder"><FolderPlus className="w-3.5 h-3.5 text-2" /></button>
            <button onClick={refresh} className="p-1 hover:bg-3 rounded" title="Refresh"><RefreshCw className="w-3.5 h-3.5 text-2" /></button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {sidebarView === 'explorer' && (
          <>
            {files.map(node => renderNode(node, 0))}
            {creating?.parentId === null && (
              <NewItemInput depth={0} name={newName} setName={setNewName} onCreate={createItem} onCancel={() => setCreating(null)} type={creating.type} />
            )}
          </>
        )}
        {sidebarView === 'search' && <SearchPanel />}
        {sidebarView === 'git' && <GitPanel />}
        {sidebarView === 'debug' && <DebugPanel />}
        {sidebarView === 'extensions' && <ExtensionsPanel />}
        {sidebarView === 'docker' && <DockerPanel />}
        {sidebarView === 'database' && <DatabasePanel />}
      </div>
    </div>
  )
}

function NewItemInput({ depth, name, setName, onCreate, onCancel, type }: any) {
  return (
    <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: `${depth * 12 + 8}px` }}>
      {type === 'folder' ? <FolderPlus className="w-3.5 h-3.5 text-2" /> : <FilePlus className="w-3.5 h-3.5 text-2" />}
      <input
        autoFocus
        className="flex-1 bg-3 border border-brand-500 rounded text-sm px-1.5 py-0.5 text-main outline-none"
        placeholder={type === 'folder' ? 'folder name' : 'file name'}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onCreate()
          if (e.key === 'Escape') onCancel()
        }}
        onBlur={onCancel}
      />
    </div>
  )
}

function SearchPanel() {
  return (
    <div className="p-3 space-y-2">
      <input className="input" placeholder="Search files…" />
      <p className="text-xs text-3">Search across all files in the project.</p>
    </div>
  )
}

function GitPanel() {
  return (
    <div className="p-3 space-y-3">
      <input className="input" placeholder="Commit message…" />
      <button className="btn-primary w-full justify-center text-xs"><GitBranch className="w-3.5 h-3.5" /> Commit</button>
      <div className="space-y-1">
        <div className="text-xs text-2 font-semibold">Changes (0)</div>
        <p className="text-xs text-3">No changes detected.</p>
      </div>
      <div className="space-y-1">
        <div className="text-xs text-2 font-semibold">Branches</div>
        <div className="flex items-center gap-1.5 text-sm text-main"><GitBranch className="w-3.5 h-3.5" /> main</div>
      </div>
    </div>
  )
}

function DebugPanel() {
  return (
    <div className="p-3 space-y-2">
      <button className="btn-primary w-full justify-center text-xs">Run & Debug</button>
      <p className="text-xs text-3">No debug configurations. Create a launch.json file.</p>
    </div>
  )
}

function ExtensionsPanel() {
  const extensions = [
    { name: 'Python', author: 'LokoCode', downloads: '5M' },
    { name: 'GitLens', author: 'LokoCode', downloads: '8M' },
    { name: 'Docker', author: 'LokoCode', downloads: '3M' },
    { name: 'AI Assistant', author: 'LokoCode', downloads: '2M' },
    { name: 'Database Tools', author: 'LokoCode', downloads: '1M' },
  ]
  return (
    <div className="p-2 space-y-2">
      <input className="input" placeholder="Search extensions…" />
      {extensions.map(ext => (
        <div key={ext.name} className="card p-2.5 flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0">
            <Blocks className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-main">{ext.name}</div>
            <div className="text-xs text-3">{ext.author} · {ext.downloads} downloads</div>
            <button className="text-xs text-brand-500 mt-1">Install</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function DockerPanel() {
  return (
    <div className="p-3 space-y-3">
      <div>
        <div className="text-xs font-semibold text-2 mb-1">Containers</div>
        <p className="text-xs text-3">No running containers.</p>
      </div>
      <div>
        <div className="text-xs font-semibold text-2 mb-1">Images</div>
        <p className="text-xs text-3">No images found.</p>
      </div>
      <button className="btn-outline w-full justify-center text-xs"><Container className="w-3.5 h-3.5" /> Build Image</button>
    </div>
  )
}

function DatabasePanel() {
  const dbs = ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite']
  return (
    <div className="p-3 space-y-2">
      <div className="text-xs font-semibold text-2 mb-2">Connections</div>
      {dbs.map(db => (
        <div key={db} className="flex items-center gap-2 text-sm text-2 hover:text-main cursor-pointer">
          <Database className="w-3.5 h-3.5" /> {db}
        </div>
      ))}
      <button className="btn-outline w-full justify-center text-xs mt-2">Add Connection</button>
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
  roots.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return roots
}
