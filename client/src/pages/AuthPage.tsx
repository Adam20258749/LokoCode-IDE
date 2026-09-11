import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Code2, Mail, Lock, User, Github, Globe, Monitor } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuth(s => s.login)
  const register = useAuth(s => s.register)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(email, username, password)
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-main">LokoCode IDE</span>
          </div>
          <p className="text-2 text-sm">One IDE. Every Language. Every Project.</p>
        </div>

        <div className="card p-6">
          <div className="flex gap-1 mb-6 p-1 bg-3 rounded-lg">
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'register' ? 'bg-brand-600 text-white' : 'text-2 hover:text-main'}`}
            >Sign Up</button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'login' ? 'bg-brand-600 text-white' : 'text-2 hover:text-main'}`}
            >Sign In</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-2 mb-1.5 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-3" />
                  <input className="input pl-10" placeholder="adamdev" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-2 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-3" />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-xs text-2 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-3" />
                <input type="password" className="input pl-10" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            {error && <div className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
              {loading ? 'Please wait…' : mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-app" />
            <span className="text-xs text-3">or continue with</span>
            <div className="flex-1 h-px bg-app" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button className="btn-outline justify-center" onClick={() => setError('OAuth providers require configuration. Use email/password for now.')}>
              <Github className="w-4 h-4" />
            </button>
            <button className="btn-outline justify-center" onClick={() => setError('OAuth providers require configuration. Use email/password for now.')}>
              <Globe className="w-4 h-4" />
            </button>
            <button className="btn-outline justify-center" onClick={() => setError('OAuth providers require configuration. Use email/password for now.')}>
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-3 mt-4">
          By signing up you agree to LokoCode IDE's Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}
