import apiClient from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  expiresAtUtc: string
  refreshToken: string
  refreshTokenExpiresAtUtc: string
}

export interface MeResponse {
  userId: string
  email: string
  userName: string
  arabicName: string
  englishName: string
  roles: string[]
}

const adminAuthService = {
  login: (data: LoginRequest) =>
    apiClient.post<never, { success: boolean; data: LoginResponse; message: string; errors: string[] }>(
      '/api/admin/AdminAuth/login',
      data,
    ),

  logout: () =>
    apiClient.post('/api/admin/AdminAuth/logout', {}),

  me: () =>
    apiClient.get<never, { success: boolean; data: MeResponse }>('/api/admin/AdminAuth/me'),
}

export default adminAuthService
