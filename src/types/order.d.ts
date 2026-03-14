/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  BANK_CARD = 'bank_card',
  CREDIT = 'credit'
}

/**
 * 订单商品项
 */
export interface OrderItem {
  id: number
  productId: number
  productName: string
  productImage: string
  sku: string
  spec: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

/**
 * 收货地址信息
 */
export interface ShippingAddress {
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  postalCode?: string
}

/**
 * 订单详情
 */
export interface OrderDetail {
  id: number
  orderNo: string
  userId: number
  username: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentTime: string | null
  totalAmount: number
  discountAmount: number
  freightAmount: number
  actualAmount: number
  items: OrderItem[]
  shippingAddress: ShippingAddress
  remark: string
  createdAt: string
  updatedAt: string
}

/**
 * 订单列表项
 */
export interface OrderListItem {
  id: number
  orderNo: string
  username: string
  status: OrderStatus
  totalAmount: number
  actualAmount: number
  itemCount: number
  paymentMethod: PaymentMethod
  createdAt: string
}

/**
 * 订单查询参数
 */
export interface OrderQueryParams {
  page: number
  pageSize: number
  orderNo?: string
  username?: string
  status?: OrderStatus
  paymentMethod?: PaymentMethod
  startDate?: string
  endDate?: string
}

/**
 * 订单状态更新参数
 */
export interface UpdateOrderStatusParams {
  orderId: number
  status: OrderStatus
  remark?: string
}

/**
 * 订单统计概览
 */
export interface OrderStatistics {
  totalOrders: number
  totalAmount: number
  pendingOrders: number
  todayOrders: number
  todayAmount: number
}
