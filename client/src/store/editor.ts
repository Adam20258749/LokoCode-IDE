import { create } from 'zustand'

export interface EditorTab {
  fileId: string
  name: string
  path: string
  content: string
  language: string
  dirty: boolean
}

export interface FileNode {
  id: string
  name: string
  path: string
  type: string
  content?: string
  parentId?: string | null
  children?: FileNode[]
}

interface EditorState {
  tabs: EditorTab[]
  activeTabId: string | null
  files: FileNode[]
  bottomPanel: 'terminal' | 'problems' | 'output' | 'preview'
  bottomPanelOpen: boolean
  aiPanelOpen: boolean
  sidebarView: 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'docker' | 'database'
  commandPaletteOpen: boolean

  setFiles: (files: FileNode[]) => void
  openTab: (file: FileNode, language: string) => void
  closeTab: (fileId: string) => void
  setActiveTab: (fileId: string) => void
  updateTabContent: (fileId: string, content: string) => void
  markTabClean: (fileId: string) => void
  setBottomPanel: (p: EditorState['bottomPanel']) => void
  toggleBottomPanel: () => void
  toggleAiPanel: () => void
  setSidebarView: (v: EditorState['sidebarView']) => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useEditor = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  files: [],
  bottomPanel: 'terminal',
  bottomPanelOpen: true,
  aiPanelOpen: true,
  sidebarView: 'explorer',
  commandPaletteOpen: false,

  setFiles: (files) => set({ files }),
  openTab: (file, language) => {
    const existing = get().tabs.find(t => t.fileId === file.id)
    if (existing) { set({ activeTabId: file.id }); return }
    set(state => ({
      tabs: [...state.tabs, {
        fileId: file.id,
        name: file.name,
        path: file.path,
        content: file.content || '',
        language,
        dirty: false,
      }],
      activeTabId: file.id,
    }))
  },
  closeTab: (fileId) => set(state => {
    const idx = state.tabs.findIndex(t => t.fileId === fileId)
    const tabs = state.tabs.filter(t => t.fileId !== fileId)
    const activeTabId = state.activeTabId === fileId
      ? (tabs[idx] || tabs[idx - 1] || tabs[0])?.fileId || null
      : state.activeTabId
    return { tabs, activeTabId }
  }),
  setActiveTab: (fileId) => set({ activeTabId: fileId }),
  updateTabContent: (fileId, content) => set(state => ({
    tabs: state.tabs.map(t => t.fileId === fileId ? { ...t, content, dirty: true } : t),
  })),
  markTabClean: (fileId) => set(state => ({
    tabs: state.tabs.map(t => t.fileId === fileId ? { ...t, dirty: false } : t),
  })),
  setBottomPanel: (p) => set({ bottomPanel: p, bottomPanelOpen: true }),
  toggleBottomPanel: () => set(state => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  toggleAiPanel: () => set(state => ({ aiPanelOpen: !state.aiPanelOpen })),
  setSidebarView: (v) => set(state => ({ sidebarView: state.sidebarView === v ? state.sidebarView : v })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}))
