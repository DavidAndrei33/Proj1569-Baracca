import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import type { Order } from '../types';

async function fetchOrders(): Promise<Order[]> {
  const res = await client.get('/orders');
  // After interceptor: response.data = { orders: [...], pagination: {...} }
  const orders = res.data?.orders || [];
  console.log('[Store] Fetched orders:', orders.length);
  
  // Normalize backend data to frontend format
  return orders.map((order: any) => ({
    id: String(order.id),
    orderNumber: order.orderNumber || `ORD-${order.id}`,
    status: order.status,
    items: order.items?.map((item: any) => ({
      name: item.name || item.product?.name || 'Produs',
      quantity: item.quantity || 1,
    })) || [],
    customerName: order.customerName || 'Client',
    phone: order.customerPhone || '',
    pickupTime: order.pickupTime || '',
    paymentMethod: order.paymentMethod || 'cash',
    total: parseFloat(order.total) || 0,
    notes: order.notes || '',
    createdAt: new Date(order.createdAt),
  }));
}

export function useOrders(enabled: boolean = true) {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    refetchInterval: 5000,
    retry: 3,
    enabled,
  });
}
