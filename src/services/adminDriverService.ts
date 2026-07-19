import apiClient from './api'
import type { AdminDriverDetailsDto, AdminDriverListItemDto } from '../types/driver'

interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  errors: string[]
}

const adminDriverService = {
  getDrivers: (search?: string, officeId?: number): Promise<ApiResponse<AdminDriverListItemDto[]>> =>
    apiClient.get('/api/admin/AdminDrivers/getDrivers', { params: { search: search || undefined, officeId } }),

  getDriverById: (id: number): Promise<ApiResponse<AdminDriverDetailsDto>> =>
    apiClient.get(`/api/admin/AdminDrivers/getDriverById/${id}`),
}

export default adminDriverService
