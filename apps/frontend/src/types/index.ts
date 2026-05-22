export interface User {
  id: string
  email: string
  full_name: string
  arabic_name?: string
  role: 'student' | 'faculty' | 'admin' | 'staff'
  student_id?: string
  faculty_id?: string
  department?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  arabic_name?: string
  role: User['role']
  student_id?: string
  department?: string
}

export interface ApiError {
  status: number
  message: string
  detail?: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface NavItem {
  label: string
  href: string
  icon?: string
  badge?: number
  children?: NavItem[]
}

export interface DashboardStat {
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: string
  color?: string
}

export interface Course {
  id: string
  code: string
  title: string
  arabic_title?: string
  credits: number
  faculty_name: string
  schedule: string
  enrolled: number
  capacity: number
  room: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
}

export type ThemeMode = 'dark' | 'light'

export interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
  children?: SidebarItem[]
}
