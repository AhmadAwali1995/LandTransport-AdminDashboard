import apiClient from './api'
import type { AdminMainOfficeDto, AdminOfficeDetailsDto, AdminOfficeDetailsFullDto, ResetOwnerPasswordResponse } from '../types/office'

interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  errors: string[]
}

const adminOfficeService = {
  getOffices: (): Promise<ApiResponse<AdminMainOfficeDto[]>> =>
    apiClient.get('/api/admin/AdminOffices/getOffices'),

  getOfficeById: (id: number): Promise<ApiResponse<AdminOfficeDetailsDto>> =>
    apiClient.get(`/api/admin/AdminOffices/getOfficeById/${id}`),

  createMainOffice: (data: unknown): Promise<ApiResponse<unknown>> =>
    apiClient.post('/api/admin/AdminOffices/createMainOffice', data),

  editOffice: (id: number, data: unknown): Promise<ApiResponse<unknown>> =>
    apiClient.put(`/api/admin/AdminOffices/editOffice/${id}`, data),

  getOfficeDetails: (id: number): Promise<ApiResponse<AdminOfficeDetailsFullDto>> =>
    apiClient.get(`/api/admin/AdminOffices/officeDetails/${id}`),

  resetOwnerPassword: (id: number): Promise<ApiResponse<ResetOwnerPasswordResponse>> =>
    apiClient.post(`/api/admin/AdminOffices/resetOwnerPassword/${id}`),
}

export default adminOfficeService
