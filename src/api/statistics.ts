import request from '@/utils/request'
import type {
  DashboardData,
  StatisticsOverview,
  StatisticsQueryParams,
  SalesTrendPoint,
  ProductSalesRank,
  UserConsumptionRank
} from '@/types/statistics.d'

const statisticsApi = {
  getDashboardData(params: StatisticsQueryParams): Promise<DashboardData> {
    return request.get('/statistics/dashboard', params)
  },

  getOverview(): Promise<StatisticsOverview> {
    return request.get('/statistics/overview')
  },

  getSalesTrend(params: StatisticsQueryParams): Promise<SalesTrendPoint[]> {
    return request.get('/statistics/sales-trend', params)
  },

  getProductSalesRank(limit: number = 10): Promise<ProductSalesRank[]> {
    return request.get('/statistics/product-rank', { limit })
  },

  getUserConsumptionRank(limit: number = 10): Promise<UserConsumptionRank[]> {
    return request.get('/statistics/user-rank', { limit })
  },

  getOrderStatusDistribution(): Promise<Array<{
    status: string
    count: number
    percentage: number
  }>> {
    return request.get('/statistics/order-status-distribution')
  },

  getPaymentDistribution(): Promise<Array<{
    method: string
    count: number
    percentage: number
  }>> {
    return request.get('/statistics/payment-distribution')
  },

  getDailyStatistics(date: string): Promise<{
    orderCount: number
    orderAmount: number
    newUserCount: number
    activeUserCount: number
  }> {
    return request.get('/statistics/daily', { date })
  },

  exportReport(params: StatisticsQueryParams): Promise<{ url: string }> {
    return request.post('/statistics/export', params)
  }
}

export default statisticsApi
