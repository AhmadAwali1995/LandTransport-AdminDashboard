import apiClient from './api'
import type { SeatRow, VehicleTemplateDto } from '../types/vehicleTemplate'

interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  errors: string[]
}

export interface CreateVehicleTemplateInput {
  arName: string
  enName: string
  arDescription: string
  enDescription: string
  rows: SeatRow[]
}

const vehicleTemplateService = {
  getAll: (): Promise<ApiResponse<VehicleTemplateDto[]>> =>
    apiClient.get('/api/admin/AdminVehicleTemplates/getTemplates'),

  getById: (id: number): Promise<ApiResponse<VehicleTemplateDto>> =>
    apiClient.get(`/api/admin/AdminVehicleTemplates/getTemplateById/${id}`),

  create: (input: CreateVehicleTemplateInput): Promise<ApiResponse<VehicleTemplateDto>> =>
    apiClient.post('/api/admin/AdminVehicleTemplates/createTemplate', input),

  update: (id: number, input: CreateVehicleTemplateInput): Promise<ApiResponse<VehicleTemplateDto>> =>
    apiClient.put(`/api/admin/AdminVehicleTemplates/updateTemplate/${id}`, input),

  remove: (id: number): Promise<ApiResponse<{ softDeleted: boolean }>> =>
    apiClient.delete(`/api/admin/AdminVehicleTemplates/deleteTemplate/${id}`),
}

export const parseTemplateRows = (htmlContent: string | null | undefined): SeatRow[] => {
  if (!htmlContent) return []
  try {
    const parsed = typeof htmlContent === 'string' ? JSON.parse(htmlContent) : htmlContent
    return Array.isArray(parsed?.rows) ? parsed.rows : []
  } catch {
    return []
  }
}

export default vehicleTemplateService
