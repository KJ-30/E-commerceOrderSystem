<template>
  <div class="order-detail">
    <div class="detail-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>返回
      </el-button>
      <h2 class="title">订单详情</h2>
      <div class="actions">
        <el-button v-if="hasPermission('order:edit') && orderDetail?.status === 'pending'" type="danger" @click="handleCancel"> 取消订单 </el-button>
        <el-button v-if="hasPermission('order:edit') && orderDetail?.status === 'paid'" type="success" @click="handleShip"> 发货 </el-button>
        <el-button v-if="hasPermission('order:edit')" type="primary" @click="showStatusDialog = true"> 修改状态 </el-button>
      </div>
    </div>

    <el-skeleton v-if="loading" :rows="10" animated />

    <template v-else-if="orderDetail">
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">基本信息</span>
            <el-tag :type="getStatusColor(orderDetail.status)" size="large">
              {{ getStatusText(orderDetail.status) }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="订单号">
            {{ orderDetail.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ orderDetail.username }}
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ getPaymentText(orderDetail.paymentMethod) }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ formatDateTime(orderDetail.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ orderDetail.paymentTime ? formatDateTime(orderDetail.paymentTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(orderDetail.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="info-card" shadow="never">
        <template #header>
          <span class="card-title">收货信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="收货人">
            {{ orderDetail.shippingAddress.receiverName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ orderDetail.shippingAddress.receiverPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ orderDetail.shippingAddress.province }}
            {{ orderDetail.shippingAddress.city }}
            {{ orderDetail.shippingAddress.district }}
            {{ orderDetail.shippingAddress.detailAddress }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="orderDetail.logistics" class="info-card" shadow="never">
        <template #header>
          <span class="card-title">物流信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="快递公司">
            {{ orderDetail.logistics.expressCompany }}
          </el-descriptions-item>
          <el-descriptions-item label="快递单号">
            {{ orderDetail.logistics.expressNo }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">
            {{ formatDateTime(orderDetail.logistics.shippedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="物流状态">
            <el-tag :type="getLogisticsStatusColor(orderDetail.logistics.status)">
              {{ getLogisticsStatusText(orderDetail.logistics.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="orderDetail.logistics.traces && orderDetail.logistics.traces.length > 0" class="logistics-traces">
          <el-timeline>
            <el-timeline-item v-for="(trace, index) in orderDetail.logistics.traces" :key="index" :timestamp="trace.time" placement="top">
              {{ trace.context }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

      <el-card class="info-card" shadow="never">
        <template #header>
          <span class="card-title">商品信息</span>
        </template>
        <el-table :data="orderDetail.items" border>
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="product-info">
                <el-image :src="row.productImage" :preview-src-list="[row.productImage]" fit="cover" class="product-image" />
                <div class="product-detail">
                  <div class="product-name">{{ row.productName }}</div>
                  <div class="product-spec">规格：{{ row.spec }}</div>
                  <div class="product-sku">SKU：{{ row.sku }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="unitPrice" label="单价" width="120">
            <template #default="{ row }">
              {{ formatMoney(row.unitPrice) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="totalPrice" label="小计" width="120">
            <template #default="{ row }">
              <span class="amount">{{ formatMoney(row.totalPrice) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="amount-summary">
          <div class="summary-row">
            <span>商品总额：</span>
            <span>{{ formatMoney(orderDetail.totalAmount) }}</span>
          </div>
          <div class="summary-row">
            <span>优惠金额：</span>
            <span class="discount">-{{ formatMoney(orderDetail.discountAmount) }}</span>
          </div>
          <div class="summary-row">
            <span>运费：</span>
            <span>{{ formatMoney(orderDetail.freightAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>实付金额：</span>
            <span class="final-amount">{{ formatMoney(orderDetail.actualAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card v-if="orderDetail.remark" class="info-card" shadow="never">
        <template #header>
          <span class="card-title">订单备注</span>
        </template>
        <p class="remark">{{ orderDetail.remark }}</p>
      </el-card>
    </template>

    <el-dialog v-model="showStatusDialog" title="修改订单状态" width="400px">
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="订单状态">
          <el-select v-model="statusForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="statusForm.remark" type="textarea" :rows="3" placeholder="请输入备注（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStatusDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleUpdateStatus"> 确定 </el-button>
      </template>
    </el-dialog>

    <ship-dialog v-model="showShipDialog" :order-id="orderDetail?.id || 0" @success="handleShipSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useOrderStore } from '@/store';
import { useAuth } from '@/hooks';
import { formatDateTime, formatMoney, getOrderStatusText, getOrderStatusColor, getPaymentMethodText } from '@/utils';
import type { OrderDetail, OrderStatus, PaymentMethod } from '@/types/order.d';
import ShipDialog from '../list/components/ShipDialog.vue';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const { hasPermission } = useAuth();

const loading = ref(false);
const orderDetail = ref<OrderDetail | null>(null);
const showStatusDialog = ref(false);
const showShipDialog = ref(false);
const submitting = ref(false);

const statusForm = reactive({
  status: '' as OrderStatus,
  remark: '',
});

const statusOptions = [
  { label: '待支付', value: 'pending' },
  { label: '已支付', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'delivered' },
  { label: '已取消', value: 'cancelled' },
  { label: '已退款', value: 'refunded' },
];

function getStatusText(status: OrderStatus): string {
  return getOrderStatusText(status);
}

function getStatusColor(status: OrderStatus): string {
  return getOrderStatusColor(status);
}

function getPaymentText(method: PaymentMethod): string {
  return getPaymentMethodText(method);
}

function getLogisticsStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待揽收',
    shipped: '运输中',
    delivered: '已签收',
  };
  return map[status] || status;
}

function getLogisticsStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'warning',
    shipped: 'primary',
    delivered: 'success',
  };
  return map[status] || 'info';
}

function goBack(): void {
  router.back();
}

async function fetchOrderDetail(): Promise<void> {
  const id = Number(route.params.id);
  if (!id) {
    ElMessage.error('订单ID无效');
    goBack();
    return;
  }

  loading.value = true;
  try {
    orderDetail.value = await orderStore.fetchOrderDetail(id);
    statusForm.status = orderDetail.value.status;
  } finally {
    loading.value = false;
  }
}

async function handleCancel(): Promise<void> {
  if (!orderDetail.value) return;

  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await orderStore.cancelOrder(orderDetail.value.id, '管理员取消');
    ElMessage.success('订单已取消');
    fetchOrderDetail();
  } catch {
    // 用户取消
  }
}

function handleShip(): void {
  showShipDialog.value = true;
}

function handleShipSuccess(): void {
  showShipDialog.value = false;
  fetchOrderDetail();
}

async function handleUpdateStatus(): Promise<void> {
  if (!orderDetail.value || !statusForm.status) {
    ElMessage.warning('请选择订单状态');
    return;
  }

  submitting.value = true;
  try {
    await orderStore.updateOrderStatus(orderDetail.value.id, statusForm.status, statusForm.remark);
    ElMessage.success('订单状态已更新');
    showStatusDialog.value = false;
    fetchOrderDetail();
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped lang="scss">
.order-detail {
  .detail-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    background: #fff;
    padding: 15px 20px;
    border-radius: 4px;

    .title {
      flex: 1;
      margin: 0 0 0 15px;
      font-size: 18px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 10px;
    }
  }

  .info-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }

    .product-info {
      display: flex;
      align-items: center;

      .product-image {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        margin-right: 12px;
      }

      .product-detail {
        .product-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .product-spec,
        .product-sku {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }

    .logistics-traces {
      margin-top: 20px;
      padding: 15px;
      background: var(--background-color);
      border-radius: 4px;
    }

    .amount-summary {
      margin-top: 20px;
      text-align: right;

      .summary-row {
        margin-bottom: 8px;
        font-size: 14px;

        &.total {
          font-size: 16px;
          font-weight: 600;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }
      }

      .discount {
        color: var(--success-color);
      }

      .final-amount {
        color: var(--danger-color);
        font-size: 20px;
      }
    }

    .remark {
      margin: 0;
      color: var(--text-regular);
      line-height: 1.6;
    }
  }

  .amount {
    color: var(--danger-color);
    font-weight: 500;
  }
}
</style>
