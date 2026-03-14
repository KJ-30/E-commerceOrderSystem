import { OrderStatus, PaymentMethod } from '@/types/order.d';
import { UserRole, UserStatus } from '@/types/user.d';

export const formatMoney = (amount: number, decimals: number = 2): string => {
  return `¥${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatDateTime = (date: string | number | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format.replace('YYYY', String(year)).replace('MM', month).replace('DD', day).replace('HH', hours).replace('mm', minutes).replace('ss', seconds);
};

export const formatDate = (date: string | number | Date): string => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const orderStatusMap: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  delivered: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export const getOrderStatusText = (status: string): string => {
  return orderStatusMap[status] || '未知状态';
};

const orderStatusColorMap: Record<string, string> = {
  pending: 'warning',
  paid: 'primary',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'danger',
};

export const getOrderStatusColor = (status: string): string => {
  return orderStatusColorMap[status] || 'info';
};

const paymentMethodMap: Record<string, string> = {
  alipay: '支付宝',
  wechat: '微信支付',
  bank_card: '银行卡',
  credit: '信用支付',
};

export const getPaymentMethodText = (method: string): string => {
  return paymentMethodMap[method] || '未知方式';
};

const userRoleMap: Record<string, string> = {
  admin: '管理员',
  manager: '运营',
  operator: '普通运营',
  service: '客服',
};

export const getUserRoleText = (role: string): string => {
  return userRoleMap[role] || '未知角色';
};

const userStatusMap: Record<number, string> = {
  [UserStatus.ACTIVE]: '启用',
  [UserStatus.INACTIVE]: '禁用',
};

export const getUserStatusText = (status: number): string => {
  return userStatusMap[status] || '未知状态';
};

const userStatusColorMap: Record<number, string> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.INACTIVE]: 'danger',
};

export const getUserStatusColor = (status: number): string => {
  return userStatusColorMap[status] || 'info';
};

export const generateOrderNo = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${year}${month}${day}${random}`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toString();
};
