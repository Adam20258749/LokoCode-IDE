import { useEffect, useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { useEditor } from '../../store/editor'
import { api } from '../../lib/api'
import { getLanguage } from '../../pages/IDEPage'
import { X, Circle, SplitSquareHorizontal, MoreHorizontal, FileCode } from 'lucide-react'

export default function EditorArea({ projectId }: { projectId: string }) {
  const { tabs, activeTabId, setActiveTab, closeTab, updateTabContent, markTabClean } = useEditor()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeTab = tabs.find(t => t.fileId === activeTabId)

  const handleMount: OnMount = (editor) => {
    editor.onDidChangeModelContent(() => {
      if (!activeTabId) return
      const value = editor.getValue()
      updateTabContent(activeTabId, value)

      // Auto-save with debounce
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        api.updateFile(activeTabId, { content: value }).then(() => {
          markTabClean(activeTabId)
        }).catch(() => {})
      }, 1000)
    })
  }

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex items-center justify-center bg-app">
          <div className="text-center">
            <FileCode className="w-16 h-16 text-3 mx-auto mb-4" />
            <p className="text-2 text-sm">Select a file to start editing</p>
            <p className="text-3 text-xs mt-1">Or create a new file from the explorer</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Tabs */}
      <div className="h-9 bg-2 border-b border-app flex items-stretch overflow-x-auto flex-shrink-0">
        {tabs.map(tab => (
          <div
            key={tab.fileId}
            onClick={() => setActiveTab(tab.fileId)}
            className={`flex items-center gap-2 px-3 cursor-pointer border-r border-app text-sm whitespace-nowrap ${
              activeTabId === tab.fileId ? 'bg-app text-main' : 'bg-2 text-2 hover:bg-3'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-3" />
            <span>{tab.name}</span>
            {tab.dirty && <Circle className="w-2 h-2 fill-current text-2" />}
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.fileId) }}
              className="hover:bg-3 rounded p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <div className="flex-1" />
        <button className="px-3 hover:bg-3 flex items-center" title="Split Editor">
          <SplitSquareHorizontal className="w-4 h-4 text-2" />
        </button>
        <button className="px-3 hover:bg-3 flex items-center" title="More">
          <MoreHorizontal className="w-4 h-4 text-2" />
        </button>
      </div>

      {/* Breadcrumbs */}
      {activeTab && (
        <div className="h-7 bg-app border-b border-app flex items-center px-3 text-xs text-3 gap-1 flex-shrink-0">
          {activeTab.path.split('/').map((part, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>›</span>}
              <span className={i === arr.length - 1 ? 'text-2' : ''}>{part}</span>
            </span>
          ))}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        {activeTab && (
          <Editor
            key={activeTab.fileId}
            language={activeTab.language}
            value={activeTab.content}
            onMount={handleMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'off',
              lineNumbers: 'on',
              folding: true,
              renderWhitespace: 'selection',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              multiCursorModifier: 'ctrlCmd',
              bracketPairColorization: { enabled: true },
            }}
          />
        )}
      </div>
    </div>
  )
}
