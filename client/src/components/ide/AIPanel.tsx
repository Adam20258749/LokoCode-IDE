import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { useEditor } from '../../store/editor'
import {
  Sparkles, Send, Plus, Trash2, Bot, User as UserIcon, X,
  Code, Bug, FileText, Wrench, Zap, BookOpen, Rocket, Hammer
} from 'lucide-react'

interface Message {
  role: string
  content: string
  timestamp?: string
}

export default function AIPanel({ projectId }: { projectId: string }) {
  const { aiPanelOpen, toggleAiPanel } = useEditor()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.getConversations().then(setConversations).catch(() => {})
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView()
  }, [messages])

  const newChat = async () => {
    const conv = await api.createConversation('New Chat')
    setConversations(prev => [conv, ...prev])
    setActiveConv(conv)
    setMessages([])
  }

  const selectConv = async (conv: any) => {
    setActiveConv(conv)
    const full = await api.getConversation(conv.id)
    setMessages(full.messages || [])
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input
    setInput('')
    setLoading(true)

    let conv = activeConv
    if (!conv) {
      conv = await api.createConversation(userMsg.slice(0, 40))
      setConversations(prev => [conv, ...prev])
      setActiveConv(conv)
    }

    await api.sendMessage(conv.id, 'user', userMsg)
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date().toISOString() }])

    // Simulated AI response (in production, this calls the AI provider via the server)
    setTimeout(() => {
      const response = generateResponse(userMsg)
      api.sendMessage(conv.id, 'assistant', response).then(() => {})
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString() }])
      setLoading(false)
    }, 800)
  }

  if (!aiPanelOpen) return null

  const quickActions = [
    { icon: Code, label: 'Explain', color: 'text-blue-500' },
    { icon: Bug, label: 'Fix Bug', color: 'text-red-500' },
    { icon: FileText, label: 'Document', color: 'text-green-500' },
    { icon: Wrench, label: 'Refactor', color: 'text-purple-500' },
    { icon: Zap, label: 'Test', color: 'text-yellow-500' },
    { icon: Rocket, label: 'Deploy', color: 'text-orange-500' },
    { icon: BookOpen, label: 'Review', color: 'text-cyan-500' },
    { icon: Hammer, label: 'Build', color: 'text-pink-500' },
  ]

  return (
    <div className="w-80 bg-2 border-l border-app flex flex-col flex-shrink-0">
      <div className="h-9 flex items-center justify-between px-3 border-b border-app">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-semibold text-2 tracking-wide">LOKOCODE AI</span>
        </div>
        <button onClick={toggleAiPanel} className="p-1 hover:bg-3 rounded"><X className="w-3.5 h-3.5 text-2" /></button>
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6 text-brand-500" />
            </div>
            <p className="text-sm text-main font-medium">How can I help you?</p>
            <p className="text-xs text-3 mt-1">Ask me to explain, generate, fix, or refactor code.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => setInput(`${action.label} the current file`)}
                className="card p-2.5 flex items-center gap-2 hover:border-brand-500 transition-colors text-left"
              >
                <action.icon className={`w-4 h-4 ${action.color}`} />
                <span className="text-xs text-main">{action.label}</span>
              </button>
            ))}
          </div>
          {conversations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-2 mb-2">Recent Chats</div>
              <div className="space-y-1">
                {conversations.slice(0, 5).map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConv(conv)}
                    className="w-full text-left px-2 py-1.5 rounded text-sm text-2 hover:text-main hover:bg-3 truncate"
                  >
                    {conv.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-brand-600' : 'bg-3'
              }`}>
                {msg.role === 'user' ? <UserIcon className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-brand-500" />}
              </div>
              <div className={`flex-1 rounded-lg p-2.5 text-sm ${msg.role === 'user' ? 'bg-brand-600/10 text-main' : 'bg-3 text-2'}`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-3 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-brand-500" />
              </div>
              <div className="flex-1 rounded-lg p-2.5 bg-3 text-2 text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <div className="border-t border-app p-3">
        <div className="flex gap-2">
          <button onClick={newChat} className="p-2 hover:bg-3 rounded" title="New Chat"><Plus className="w-4 h-4 text-2" /></button>
          <input
            className="input flex-1"
            placeholder="Ask LokoCode AI…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button onClick={send} disabled={loading} className="btn-primary p-2"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}

function generateResponse(prompt: string): string {
  const lower = prompt.toLowerCase()
  if (lower.includes('explain')) {
    return "Here's what this code does:\n\nThe code defines a function that takes input and processes it. It uses standard patterns for error handling and data transformation.\n\nKey points:\n• The function follows a pure, side-effect-free approach\n• Error handling is implemented with try/catch\n• The return type is explicitly defined\n\nWould you like me to suggest any improvements?"
  }
  if (lower.includes('fix')) {
    return "I found the issue:\n\n1. The variable was being used before initialization\n2. The async function was missing an await keyword\n\nI've prepared a fix. Would you like me to apply it?\n\n```js\n// Fixed version\nconst result = await fetchData();\nconsole.log(result);\n```"
  }
  if (lower.includes('refactor')) {
    return "Here's a refactored version:\n\n• Extracted repeated logic into a helper function\n• Simplified conditional logic using early returns\n• Added type annotations for better IntelliSense\n\nThe refactored code is more maintainable and has the same behavior."
  }
  if (lower.includes('test')) {
    return "I'll generate tests for this code:\n\n```js\ndescribe('functionName', () => {\n  it('should handle valid input', () => {\n    expect(functionName(validInput)).toBe(expectedOutput);\n  });\n\n  it('should handle edge cases', () => {\n    expect(functionName(null)).toBe(null);\n  });\n});\n```\n\nShall I create the test file?"
  }
  if (lower.includes('build') || lower.includes('create')) {
    return "I'll help you build this! Here's my plan:\n\n1. ✓ Create project structure\n2. ✓ Set up dependencies\n3. ✓ Write core components\n4. ✓ Configure build system\n5. ✓ Create database schema\n6. ✓ Write tests\n7. ✓ Start preview\n\nReady to start building. Shall I proceed?"
  }
  return "I understand you want help with that. Let me analyze your project and provide assistance.\n\nI can:\n• Explain code in detail\n• Generate new code or files\n• Fix bugs and errors\n• Refactor for better structure\n• Write tests\n• Create documentation\n\nWhat would you like me to do first?"
}
