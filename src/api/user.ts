import request from '@/utils/request'
import type {
  LoginParams,
  LoginResult,
  UserInfo,
  UserQueryParams,
  UserListItem,
  PaginatedResponse,
  CreateUserParams,
  UpdateUserParams
} from '@/types/user.d'

const userApi = {
  login(params: LoginParams): Promise<LoginResult> {
    return request.post('/auth/login', params)
  },

  logout(): Promise<void> {
    return request.post('/auth/logout')
  },

  getCurrentUser(): Promise<UserInfo> {
    return request.get('/user/current')
  },

  updateCurrentUser(data: Partial<UserInfo>): Promise<UserInfo> {
    return request.put('/user/current', data)
  },

  changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return request.put('/user/password', { oldPassword, newPassword })
  },

  getUserList(params: UserQueryParams): Promise<PaginatedResponse<UserListItem>> {
    return request.get('/user/list', params)
  },

  getUserDetail(id: number): Promise<UserInfo> {
    return request.get(`/user/${id}`)
  },

  createUser(params: CreateUserParams): Promise<UserInfo> {
    return request.post('/user', params)
  },

  updateUser(params: UpdateUserParams): Promise<UserInfo> {
    const { id, ...data } = params
    return request.put(`/user/${id}`, data)
  },

  deleteUser(id: number): Promise<void> {
    return request.delete(`/user/${id}`)
  },

  batchDeleteUsers(ids: number[]): Promise<void> {
    return request.post('/user/batch-delete', { ids })
  },

  resetPassword(id: number): Promise<void> {
    return request.post(`/user/${id}/reset-password`)
  },

  refreshToken(): Promise<{ token: string }> {
    return request.post('/auth/refresh-token')
  }
}

export default userApi
