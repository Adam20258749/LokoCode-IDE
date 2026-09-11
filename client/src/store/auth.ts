import { create } from 'zustand'
import { api } from '../lib/api'

interface User {
  id: string
  email: string
  username: string
  avatar?: string
  plan: string
  role?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  init: async () => {
    const token = localStorage.getItem('lokocode_token')
    if (!token) { set({ loading: false }); return }
    try {
      const user = await api.me()
      set({ user, loading: false })
    } catch {
      localStorage.removeItem('lokocode_token')
      set({ user: null, loading: false })
    }
  },
  login: async (email, password) => {
    const { token, user } = await api.login(email, password)
    localStorage.setItem('lokocode_token', token)
    set({ user })
  },
  register: async (email, username, password) => {
    const { token, user } = await api.register(email, username, password)
    localStorage.setItem('lokocode_token', token)
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('lokocode_token')
    set({ user: null })
  },
}))
