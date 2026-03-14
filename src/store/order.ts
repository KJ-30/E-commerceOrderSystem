import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { orderApi } from '@/api';
import type { OrderListItem, OrderDetail, OrderQueryParams, OrderStatistics, PaginatedResponse } from '@/types/order.d';

export const useOrderStore = defineStore('order', () => {
  const orderList = ref<OrderListItem[]>([]);
  const currentOrder = ref<OrderDetail | null>(null);
  const statistics = ref<OrderStatistics | null>(null);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const loading = ref(false);
  const queryParams = ref<OrderQueryParams>({
    page: 1,
    pageSize: 10,
  });

  const hasOrders = computed(() => orderList.value.length > 0);
  const pendingCount = computed(() => statistics.value?.pendingOrders || 0);

  async function fetchOrderList(params: OrderQueryParams): Promise<PaginatedResponse<OrderListItem>> {
    loading.value = true;
    try {
      const result = await orderApi.getOrderList(params);
      orderList.value = result.list;
      total.value = result.total;
      currentPage.value = result.page;
      pageSize.value = result.pageSize;
      queryParams.value = params;
      return result;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrderDetail(id: number): Promise<OrderDetail> {
    loading.value = true;
    try {
      const detail = await orderApi.getOrderDetail(id);
      currentOrder.value = detail;
      return detail;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStatistics(): Promise<OrderStatistics> {
    const result = await orderApi.getOrderStatistics();
    statistics.value = result;
    return result;
  }

  async function updateOrderStatus(orderId: number, status: string, remark?: string): Promise<void> {
    await orderApi.updateOrderStatus({ orderId, status: status as never, remark });
    if (currentOrder.value && currentOrder.value.id === orderId) {
      await fetchOrderDetail(orderId);
    }
    const index = orderList.value.findIndex((item) => item.id === orderId);
    if (index !== -1) {
      orderList.value[index] = { ...orderList.value[index], status: status as never };
    }
  }

  async function cancelOrder(id: number, reason: string): Promise<void> {
    await orderApi.cancelOrder(id, reason);
    if (currentOrder.value && currentOrder.value.id === id) {
      currentOrder.value.status = 'cancelled';
    }
    const index = orderList.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      orderList.value[index] = { ...orderList.value[index], status: 'cancelled' };
    }
  }

  async function deleteOrder(id: number): Promise<void> {
    await orderApi.deleteOrder(id);
    orderList.value = orderList.value.filter((item) => item.id !== id);
    total.value--;
    if (currentOrder.value && currentOrder.value.id === id) {
      currentOrder.value = null;
    }
  }

  async function batchDeleteOrders(ids: number[]): Promise<void> {
    await orderApi.batchDeleteOrders(ids);
    orderList.value = orderList.value.filter((item) => !ids.includes(item.id));
    total.value -= ids.length;
  }

  function resetState(): void {
    orderList.value = [];
    currentOrder.value = null;
    statistics.value = null;
    total.value = 0;
    currentPage.value = 1;
    loading.value = false;
  }

  return {
    orderList,
    currentOrder,
    statistics,
    total,
    currentPage,
    pageSize,
    loading,
    queryParams,
    hasOrders,
    pendingCount,
    fetchOrderList,
    fetchOrderDetail,
    fetchStatistics,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    batchDeleteOrders,
    resetState,
  };
});
