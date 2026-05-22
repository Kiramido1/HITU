import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserRole = 'admin' | 'doctor' | 'assistant' | 'student'

interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  department?: string
  is_active: boolean
  created_at: string
  avatar_url?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  createdAt: Date
}

interface AppState {
  // Auth
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void

  // UI
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  theme: 'dark' | 'light'
  toggleTheme: () => void
  pageLoading: boolean
  setPageLoading: (v: boolean) => void

  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Active semester / context
  activeSemesterId: string | null
  setActiveSemester: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ accessToken: token }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),

      // UI
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      pageLoading: false,
      setPageLoading: (v) => set({ pageLoading: v }),

      // Notifications
      notifications: [],
      unreadCount: 0,
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            ...s.notifications,
            { ...n, id: Math.random().toString(36).slice(2), createdAt: new Date() },
          ].slice(-10),
          unreadCount: s.unreadCount + 1,
        })),
      removeNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
          unreadCount: Math.max(0, s.unreadCount - 1)
        })),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      // Semester
      activeSemesterId: null,
      setActiveSemester: (id) => set({ activeSemesterId: id }),
    }),
    {
      name: 'hitu-app-store',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
        activeSemesterId: s.activeSemesterId,
      }),
    }
  )
)
