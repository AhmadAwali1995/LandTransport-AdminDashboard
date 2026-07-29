import apiClient from './api'
import type { AdminEmployeeListItemDto } from '../types/employee'

interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  errors: string[]
}

const adminEmployeeService = {
  getEmployees: (search?: string, officeId?: number, title?: string): Promise<ApiResponse<AdminEmployeeListItemDto[]>> =>
    apiClient.get('/api/admin/AdminEmployees/getEmployees', { params: { search: search || undefined, officeId, title: title || undefined } }),

  getEmployeeTitles: (officeId?: number): Promise<ApiResponse<string[]>> =>
    apiClient.get('/api/admin/AdminEmployees/getEmployeeTitles', { params: { officeId } }),
}

export default adminEmployeeService
