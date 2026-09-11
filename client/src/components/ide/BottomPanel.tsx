import { useState, useRef, useEffect } from 'react'
import { useEditor } from '../../store/editor'
import { Terminal as TerminalIcon, AlertCircle, FileOutput, Eye, X, Plus, Trash2, ChevronDown } from 'lucide-react'

export default function BottomPanel({ projectId }: { projectId: string }) {
  const { bottomPanel, setBottomPanel, bottomPanelOpen, toggleBottomPanel } = useEditor()

  if (!bottomPanelOpen) {
    return (
      <div className="h-9 bg-2 border-t border-app flex items-center px-2 gap-1 flex-shrink-0">
        <button onClick={toggleBottomPanel} className="flex items-center gap-2 px-2 py-1 text-xs text-2 hover:text-main hover:bg-3 rounded">
          <ChevronDown className="w-3.5 h-3.5" /> Show Panel
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
    { id: 'problems', label: 'Problems', icon: AlertCircle },
    { id: 'output', label: 'Output', icon: FileOutput },
    { id: 'preview', label: 'Preview', icon: Eye },
  ] as const

  return (
    <div className="h-64 bg-2 border-t border-app flex flex-col flex-shrink-0">
      <div className="h-9 flex items-center border-b border-app">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setBottomPanel(tab.id)}
            className={`flex items-center gap-1.5 px-3 h-full text-xs border-r border-app transition-colors ${
              bottomPanel === tab.id ? 'text-main bg-app' : 'text-2 hover:text-main'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1 px-2">
          <button className="p-1 hover:bg-3 rounded" title="New Terminal"><Plus className="w-3.5 h-3.5 text-2" /></button>
          <button className="p-1 hover:bg-3 rounded" title="Kill"><Trash2 className="w-3.5 h-3.5 text-2" /></button>
          <button onClick={toggleBottomPanel} className="p-1 hover:bg-3 rounded" title="Hide"><X className="w-3.5 h-3.5 text-2" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {bottomPanel === 'terminal' && <Terminal />}
        {bottomPanel === 'problems' && <Problems />}
        {bottomPanel === 'output' && <Output />}
        {bottomPanel === 'preview' && <Preview projectId={projectId} />}
      </div>
    </div>
  )
}

function Terminal() {
  const [lines, setLines] = useState<string[]>([
    'LokoCode Terminal v1.0.0',
    'Type "help" for available commands.',
    '',
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView()
  }, [lines])

  const runCommand = (cmd: string) => {
    const newLines = [...lines, `$ ${cmd}`]
    const [command, ...args] = cmd.trim().split(/\s+/)

    const output = executeCommand(command, args)
    if (output) newLines.push(...output)
    setLines([...newLines, ''])
  }

  const executeCommand = (cmd: string, args: string[]): string[] => {
    switch (cmd) {
      case 'help':
        return [
          'Available commands:',
          '  help        Show this help',
          '  ls          List files',
          '  pwd         Print working directory',
          '  echo        Print text',
          '  clear       Clear terminal',
          '  npm         Simulated npm',
          '  node        Simulated node',
          '  git         Simulated git',
          '  python      Simulated python',
          '  whoami      Show current user',
          '  date        Show current date',
        ]
      case 'ls':
        return ['src/  README.md  package.json  .gitignore']
      case 'pwd':
        return ['/workspace/project']
      case 'echo':
        return [args.join(' ')]
      case 'clear':
        setLines([])
        return []
      case 'whoami':
        return ['developer']
      case 'date':
        return [new Date().toString()]
      case 'npm':
        if (args[0] === 'install' || args[0] === 'i') return ['Installing dependencies...', 'added 248 packages in 3s', 'found 0 vulnerabilities']
        if (args[0] === 'run' && args[1] === 'dev') return ['Starting dev server...', '  ➜  Local:   http://localhost:5173/']
        if (args[0] === 'test') return ['PASS  src/App.test.tsx', 'Tests: 1 passed, 1 total']
        return [`npm ${args.join(' ')}`]
      case 'node':
        return [`> ${args.join(' ')}`, 'undefined']
      case 'git':
        if (args[0] === 'status') return ['On branch main', 'nothing to commit, working tree clean']
        if (args[0] === 'log') return ['commit a1b2c3d (HEAD -> main)', 'Author: Developer <dev@lokocode.io>', 'Date:   ' + new Date().toDateString(), '', '    Initial commit']
        return [`git ${args.join(' ')}`]
      case 'python':
        return [`Python 3.12.1`, `>>> ${args.join(' ')}`]
      case '':
        return []
      default:
        return [`command not found: ${cmd}`, 'Type "help" for available commands.']
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand(input)
      if (input.trim()) setHistory(prev => [...prev, input])
      setInput('')
      setHistIdx(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(idx)
      setInput(history[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const idx = histIdx + 1
      if (idx >= history.length) { setHistIdx(-1); setInput('') }
      else { setHistIdx(idx); setInput(history[idx]) }
    }
  }

  return (
    <div className="h-full overflow-y-auto p-3 font-mono text-sm text-2" onClick={() => document.getElementById('term-input')?.focus()}>
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap leading-relaxed">
          {line.startsWith('$') ? <span className="text-green-500">{line}</span> : line}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="text-green-500">$</span>
        <input
          id="term-input"
          className="flex-1 bg-transparent outline-none text-main font-mono text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          spellCheck={false}
        />
      </div>
      <div ref={endRef} />
    </div>
  )
}

function Problems() {
  return (
    <div className="p-3 text-sm text-2">
      <p className="text-3">No problems detected in the workspace.</p>
    </div>
  )
}

function Output() {
  return (
    <div className="p-3 font-mono text-sm text-2 space-y-1">
      <div>[info] LokoCode IDE v1.0.0</div>
      <div>[info] Project loaded successfully</div>
      <div>[info] File watcher active</div>
      <div>[info] Auto-save enabled (1000ms delay)</div>
      <div className="text-green-500">[ready] Development environment ready</div>
    </div>
  )
}

function Preview({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-9 flex items-center gap-2 px-3 border-b border-app bg-3">
        <div className="flex gap-1">
          <button className="px-2 py-1 text-xs rounded bg-app text-main">Desktop</button>
          <button className="px-2 py-1 text-xs rounded text-2 hover:text-main">Tablet</button>
          <button className="px-2 py-1 text-xs rounded text-2 hover:text-main">Mobile</button>
        </div>
        <input className="flex-1 input text-xs" defaultValue="http://localhost:5173" />
        <button className="btn-ghost text-xs">Refresh</button>
      </div>
      <div className="flex-1 flex items-center justify-center bg-app">
        <div className="text-center">
          <Eye className="w-12 h-12 text-3 mx-auto mb-3" />
          <p className="text-2 text-sm">Preview will appear here when the dev server is running</p>
          <p className="text-3 text-xs mt-1">Click "Run" in the top bar to start the development server</p>
        </div>
      </div>
    </div>
  )
}
