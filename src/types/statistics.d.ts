/**
 * 销售趋势数据点
 */
export interface SalesTrendPoint {
  date: string
  orderCount: number
  amount: number
}

/**
 * 商品销售排行项
 */
export interface ProductSalesRank {
  rank: number
  productId: number
  productName: string
  productImage: string
  salesCount: number
  salesAmount: number
}

/**
 * 订单状态分布
 */
export interface OrderStatusDistribution {
  status: string
  statusName: string
  count: number
  percentage: number
}

/**
 * 支付方式分布
 */
export interface PaymentDistribution {
  method: string
  methodName: string
  count: number
  percentage: number
}

/**
 * 用户消费排行
 */
export interface UserConsumptionRank {
  rank: number
  userId: number
  username: string
  orderCount: number
  totalAmount: number
}

/**
 * 统计概览数据
 */
export interface StatisticsOverview {
  totalOrders: number
  totalAmount: number
  totalUsers: number
  todayOrders: number
  todayAmount: number
  todayNewUsers: number
  orderGrowthRate: number
  amountGrowthRate: number
}

/**
 * 统计查询参数
 */
export interface StatisticsQueryParams {
  startDate: string
  endDate: string
  type?: 'day' | 'week' | 'month'
}

/**
 * 仪表盘统计数据
 */
export interface DashboardData {
  overview: StatisticsOverview
  salesTrend: SalesTrendPoint[]
  orderStatusDistribution: OrderStatusDistribution[]
  paymentDistribution: PaymentDistribution[]
  productSalesRank: ProductSalesRank[]
  userConsumptionRank: UserConsumptionRank[]
}
