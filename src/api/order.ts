import request from '@/utils/request'
import type {
  OrderDetail,
  OrderListItem,
  OrderQueryParams,
  OrderStatistics,
  UpdateOrderStatusParams,
  PaginatedResponse
} from '@/types/order.d'

const orderApi = {
  getOrderList(params: OrderQueryParams): Promise<PaginatedResponse<OrderListItem>> {
    return request.get('/order/list', params)
  },

  getOrderDetail(id: number): Promise<OrderDetail> {
    return request.get(`/order/${id}`)
  },

  getOrderByNo(orderNo: string): Promise<OrderDetail> {
    return request.get('/order/detail', { orderNo })
  },

  updateOrderStatus(params: UpdateOrderStatusParams): Promise<void> {
    return request.put(`/order/${params.orderId}/status`, {
      status: params.status,
      remark: params.remark
    })
  },

  cancelOrder(id: number, reason: string): Promise<void> {
    return request.post(`/order/${id}/cancel`, { reason })
  },

  shipOrder(id: number, expressCompany: string, expressNo: string): Promise<void> {
    return request.post(`/order/${id}/ship`, { expressCompany, expressNo })
  },

  exportOrders(params: OrderQueryParams): Promise<{ url: string }> {
    return request.post('/order/export', params)
  },

  getOrderStatistics(): Promise<OrderStatistics> {
    return request.get('/order/statistics')
  },

  deleteOrder(id: number): Promise<void> {
    return request.delete(`/order/${id}`)
  },

  batchDeleteOrders(ids: number[]): Promise<void> {
    return request.post('/order/batch-delete', { ids })
  },

  getOrderLogs(id: number): Promise<Array<{
    id: number
    operator: string
    action: string
    remark: string
    createdAt: string
  }>> {
    return request.get(`/order/${id}/logs`)
  }
}

export default orderApi
