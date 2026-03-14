import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import type { ApiResponse, ApiError } from '@/types/api.d';
import mockApi from '@/mock';

interface RequestInstance {
  instance: AxiosInstance;
  get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T>;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TIMEOUT = 15000;
const USE_MOCK = true;

let loadingInstance: ReturnType<typeof ElLoading.service> | null = null;
let requestCount = 0;

const showLoading = (): void => {
  if (requestCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
  }
  requestCount++;
};

const hideLoading = (): void => {
  requestCount--;
  if (requestCount <= 0) {
    requestCount = 0;
    loadingInstance?.close();
  }
};

const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    if (data.code === 200) {
      return data.data;
    }
    ElMessage.error(data.message || '请求失败');
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error: AxiosError<ApiError>) => {
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
          break;
        case 403:
          ElMessage.error('没有权限访问该资源');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error(response.data?.message || '请求失败');
      }
    } else {
      ElMessage.error('网络连接异常，请检查网络');
    }
    return Promise.reject(error);
  },
);

async function mockRequest<T>(url: string, method: string, params?: Record<string, unknown>, data?: unknown): Promise<T> {
  const mockApiMethods: Record<string, Record<string, (params?: unknown, data?: unknown) => Promise<T>>> = {
    '/auth/login': { POST: mockApi.login.bind(mockApi) },
    '/auth/logout': { POST: mockApi.logout.bind(mockApi) },
    '/user/current': { GET: mockApi.getCurrentUser.bind(mockApi) },
    '/user/list': { GET: mockApi.getUserList.bind(mockApi) },
    '/order/list': { GET: mockApi.getOrderList.bind(mockApi) },
    '/order/statistics': { GET: mockApi.getOrderStatistics.bind(mockApi) },
    '/statistics/overview': { GET: mockApi.getOverview.bind(mockApi) },
    '/statistics/sales-trend': { GET: mockApi.getSalesTrend.bind(mockApi) },
    '/statistics/product-rank': { GET: mockApi.getProductSalesRank.bind(mockApi) },
    '/statistics/user-rank': { GET: mockApi.getUserConsumptionRank.bind(mockApi) },
    '/statistics/order-status-distribution': { GET: mockApi.getOrderStatusDistribution.bind(mockApi) },
    '/statistics/payment-distribution': { GET: mockApi.getPaymentDistribution.bind(mockApi) },
  };

  const routeHandler = mockApiMethods[url];
  if (routeHandler) {
    const handler = routeHandler[method];
    if (handler) {
      return handler(params, data);
    }
  }

  if (url.match(/\/order\/\d+$/)) {
    const id = parseInt(url.split('/').pop() || '0');
    return mockApi.getOrderDetail(id) as Promise<T>;
  }

  throw new Error(`Mock API not found: ${url}`);
}

const request: RequestInstance = {
  instance: service,

  async get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    showLoading();
    try {
      if (USE_MOCK) {
        return await mockRequest<T>(url, 'GET', params);
      }
      const response = await service.get<unknown, T>(url, { params, ...config });
      return response;
    } finally {
      hideLoading();
    }
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    showLoading();
    try {
      if (USE_MOCK) {
        return await mockRequest<T>(url, 'POST', undefined, data);
      }
      const response = await service.post<unknown, T>(url, data, config);
      return response;
    } finally {
      hideLoading();
    }
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    showLoading();
    try {
      if (USE_MOCK) {
        return await mockRequest<T>(url, 'PUT', undefined, data);
      }
      const response = await service.put<unknown, T>(url, data, config);
      return response;
    } finally {
      hideLoading();
    }
  },

  async delete<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    showLoading();
    try {
      if (USE_MOCK) {
        return await mockRequest<T>(url, 'DELETE', params);
      }
      const response = await service.delete<unknown, T>(url, { params, ...config });
      return response;
    } finally {
      hideLoading();
    }
  },
};

export default request;
