/**
 * API 响应基础结构
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * API 错误响应
 */
export interface ApiError {
  code: number
  message: string
  details?: string
}

/**
 * 请求配置
 */
export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
  timeout?: number
  showLoading?: boolean
  showError?: boolean
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  success: number
  failed: number
  total: number
  errors?: Array<{ id: number; reason: string }>
}
