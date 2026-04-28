export type OrderStatus = 'RECEIVED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'CANCELLED';

export interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  customerName: string;
  phone: string;
  pickupTime?: string;
  paymentMethod: string;
  total: number;
  notes?: string;
  allergies?: string;
  createdAt: Date;
}

export interface FilterTab {
  id: 'all' | OrderStatus;
  label: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  tableNumber?: string;
  tablePreference?: string;
  occasion?: string;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
}
