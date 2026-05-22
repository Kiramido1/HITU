// API service layer using axios + React Query patterns
import axios from 'axios'
import { useAppStore } from '@/store'

const BASE_URL = '/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Request interceptor — attach auth token
apiClient.interceptors.request.use((config) => {
  const token = useAppStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth Services ─────────────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  },
  register: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/auth/register', payload)
    return data
  },
  refresh: async (refresh_token: string) => {
    const { data } = await apiClient.post('/auth/refresh', { refresh_token })
    return data
  },
  me: async () => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },
  logout: async () => {
    const { data } = await apiClient.post('/auth/logout')
    return data
  },
}

// ── Health check ──────────────────────────────────────────────────────────────

export const healthCheck = async () => {
  const { data } = await apiClient.get('/health')
  return data
}

// ── Academic Services ───────────────────────────────────────────────────────────

export const academicService = {
  // Semesters
  getSemesters: async (params?: any) => {
    const { data } = await apiClient.get('/academic/semesters', { params })
    return data
  },
  getActiveSemester: async () => {
    const { data } = await apiClient.get('/academic/semesters/active')
    return data
  },
  createSemester: async (payload: any) => {
    const { data } = await apiClient.post('/academic/semesters', payload)
    return data
  },
  updateSemester: async (id: string, payload: any) => {
    const { data } = await apiClient.put(`/academic/semesters/${id}`, payload)
    return data
  },
  activateSemester: async (id: string) => {
    const { data } = await apiClient.put(`/academic/semesters/${id}/activate`)
    return data
  },
  archiveSemester: async (id: string) => {
    const { data } = await apiClient.put(`/academic/semesters/${id}/archive`)
    return data
  },
  deleteSemester: async (id: string) => {
    const { data } = await apiClient.delete(`/academic/semesters/${id}`)
    return data
  },

  // Departments
  getDepartments: async (params?: any) => {
    const { data } = await apiClient.get('/academic/departments', { params })
    return data
  },
  createDepartment: async (payload: any) => {
    const { data } = await apiClient.post('/academic/departments', payload)
    return data
  },
  updateDepartment: async (id: string, payload: any) => {
    const { data } = await apiClient.put(`/academic/departments/${id}`, payload)
    return data
  },
  deleteDepartment: async (id: string) => {
    const { data } = await apiClient.delete(`/academic/departments/${id}`)
    return data
  },

  // Courses
  getCourses: async (params?: any) => {
    const { data } = await apiClient.get('/academic/courses', { params })
    return data
  },
  getCourse: async (id: string) => {
    const { data } = await apiClient.get(`/academic/courses/${id}`)
    return data
  },
  createCourse: async (payload: any) => {
    const { data } = await apiClient.post('/academic/courses', payload)
    return data
  },
  updateCourse: async (id: string, payload: any) => {
    const { data } = await apiClient.put(`/academic/courses/${id}`, payload)
    return data
  },
  deleteCourse: async (id: string) => {
    const { data } = await apiClient.delete(`/academic/courses/${id}`)
    return data
  },
  assignDoctor: async (courseId: string, doctorId: string) => {
    const { data } = await apiClient.post(`/academic/courses/${courseId}/assign-doctor`, null, {
      params: { doctor_id: doctorId },
    })
    return data
  },
  assignAssistant: async (courseId: string, assistantId: string, sectionGroup?: number) => {
    const { data } = await apiClient.post(`/academic/courses/${courseId}/assign-assistant`, null, {
      params: { assistant_id: assistantId, section_group: sectionGroup },
    })
    return data
  },
  getStudents: async (params?: { skip?: number; limit?: number }) => {
    const { data } = await apiClient.get('/academic/students', { params })
    return data
  },

  // Halls
  getHalls: async (params?: any) => {
    const { data } = await apiClient.get('/academic/halls', { params })
    return data
  },
  createHall: async (payload: any) => {
    const { data } = await apiClient.post('/academic/halls', payload)
    return data
  },
  updateHall: async (id: string, payload: any) => {
    const { data } = await apiClient.put(`/academic/halls/${id}`, payload)
    return data
  },
  deleteHall: async (id: string) => {
    const { data } = await apiClient.delete(`/academic/halls/${id}`)
    return data
  },

  // Doctors
  getDoctors: async (params?: any) => {
    const { data } = await apiClient.get('/academic/doctors', { params })
    return data
  },
  getDoctorSchedule: async (doctorId: string, semesterId: string) => {
    const { data } = await apiClient.get(`/academic/doctors/${doctorId}/schedule`, { params: { semester_id: semesterId } })
    return data
  },
  getDoctorWorkload: async (doctorId: string, semesterId: string) => {
    const { data } = await apiClient.get(`/academic/doctors/${doctorId}/workload`, { params: { semester_id: semesterId } })
    return data
  },

  // Assistants
  getAssistants: async (params?: any) => {
    const { data } = await apiClient.get('/academic/assistants', { params })
    return data
  },
  getAssistantAssignments: async (assistantId: string, semesterId: string) => {
    const { data } = await apiClient.get(`/academic/assistants/${assistantId}/assignments`, { params: { semester_id: semesterId } })
    return data
  },

  // Availability
  getMyAvailability: async () => {
    const { data } = await apiClient.get('/academic/availability')
    return data
  },
  setMyAvailability: async (slots: any[]) => {
    const { data } = await apiClient.put('/academic/availability', { slots })
    return data
  },

  // Schedule
  generateSchedule: async (semesterId: string, optimizeFor = 'balanced', maxSolveTime = 30.0) => {
    const { data } = await apiClient.post('/academic/schedule/generate', null, {
      params: { semester_id: semesterId, optimize_for: optimizeFor, max_solve_time: maxSolveTime }
    })
    return data
  },
  generateSectionSchedule: async (courseId: string, semesterId: string, maxSolveTime = 15.0) => {
    const { data } = await apiClient.post(`/academic/schedule/generate-sections/${courseId}`, null, {
      params: { semester_id: semesterId, max_solve_time: maxSolveTime }
    })
    return data
  },
  validateSchedule: async (semesterId: string) => {
    const { data } = await apiClient.get(`/academic/schedule/validate/${semesterId}`)
    return data
  },
  getSchedule: async (semesterId: string) => {
    const { data } = await apiClient.get(`/academic/schedule/${semesterId}`)
    return data
  },

  // Statistics
  getDashboardOverview: async () => {
    const { data } = await apiClient.get('/academic/dashboard/overview')
    return data
  },
  getSemesterStatistics: async (semesterId: string) => {
    const { data } = await apiClient.get(`/academic/statistics/semester/${semesterId}`)
    return data
  },
  getDepartmentStatistics: async (departmentId: string) => {
    const { data } = await apiClient.get(`/academic/statistics/department/${departmentId}`)
    return data
  },
  getHallUtilization: async (hallId: string, semesterId: string) => {
    const { data } = await apiClient.get(`/academic/statistics/hall/${hallId}`, { params: { semester_id: semesterId } })
    return data
  },
}

// ── LMS Services ───────────────────────────────────────────────────────────────

export const usersService = {
  list: async (params?: { page?: number; page_size?: number }) => {
    const { data } = await apiClient.get('/users/', { params })
    return data
  },
  search: async (q: string) => {
    const { data } = await apiClient.get('/users/search', { params: { q } })
    return data
  },
  updateMe: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.put('/users/me', payload)
    return data
  },
  update: async (userId: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put(`/users/${userId}`, payload)
    return data
  },
  deactivate: async (userId: string) => {
    const { data } = await apiClient.delete(`/users/${userId}`)
    return data
  },
}

export const lmsService = {
  getMyCourses: async () => {
    const { data } = await apiClient.get('/lms/my/courses')
    return data
  },
  getMyMaterials: async () => {
    const { data } = await apiClient.get('/lms/my/materials')
    return data
  },
  getMyAssignments: async () => {
    const { data } = await apiClient.get('/lms/my/assignments')
    return data
  },
  getCourseMaterials: async (courseId: string) => {
    const { data } = await apiClient.get(`/lms/courses/${courseId}/materials`)
    return data
  },
  uploadMaterial: async (courseId: string, formData: FormData) => {
    // Requires multipart/form-data
    const { data } = await apiClient.post(`/lms/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },
  deleteMaterial: async (materialId: string) => {
    const { data } = await apiClient.delete(`/lms/materials/${materialId}`)
    return data
  },
  getCourseAssignments: async (courseId: string) => {
    const { data } = await apiClient.get(`/lms/courses/${courseId}/assignments`)
    return data
  },
  createAssignment: async (payload: any) => {
    const { data } = await apiClient.post(`/lms/assignments`, payload)
    return data
  },
  submitAssignment: async (formData: FormData) => {
    const { data } = await apiClient.post(`/lms/submissions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },
  gradeSubmission: async (submissionId: string, payload: { grade: number, feedback: string }) => {
    const { data } = await apiClient.put(`/lms/submissions/${submissionId}/grade`, payload)
    return data
  },
  getNotifications: async (unreadOnly = false) => {
    const { data } = await apiClient.get('/lms/notifications', { params: { unread_only: unreadOnly } })
    return data
  },
  markAllNotificationsRead: async () => {
    const { data } = await apiClient.put('/lms/notifications/read-all')
    return data
  },
}

export const exportService = {
  scheduleExcel: async (semesterId: string) => {
    const { data } = await apiClient.get(`/export/schedule/${semesterId}/excel`, { responseType: 'blob' })
    return data
  },
  schedulePdf: async (semesterId: string) => {
    const { data } = await apiClient.get(`/export/schedule/${semesterId}/pdf`, { responseType: 'blob' })
    return data
  },
}
