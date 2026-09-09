import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('lokocode_theme') as Theme) || 'dark',
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('lokocode_theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    set({ theme: next })
  },
  set: (t) => {
    localStorage.setItem('lokocode_theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
    set({ theme: t })
  },
}))
