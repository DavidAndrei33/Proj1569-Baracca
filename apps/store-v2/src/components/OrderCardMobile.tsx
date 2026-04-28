import { motion } from 'framer-motion';
import { Clock, Phone, User, CreditCard, Banknote, AlertTriangle, ChevronRight, ChevronLeft, Loader2, X } from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import { formatTimeAgo } from '../utils/time';
import { useKDSStore } from '../store';
import { useEffect, useState } from 'react';
import client from '../api/client';

// Payment method display config
const paymentConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  cash: { label: 'Numerar', icon: Banknote, color: 'text-green-400', bg: 'bg-green-400/10' },
  card_on_delivery: { label: 'Card POS', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

interface OrderCardMobileProps {
  order: Order;
  index: number;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; next: OrderStatus | null; prev: OrderStatus | null }
> = {
  RECEIVED: {
    label: 'Comenzi Noi',
    color: 'text-status-new',
    bg: 'bg-status-new/10',
    border: 'border-status-new/30',
    next: 'PREPARING',
    prev: null,
  },
  ACCEPTED: {
    label: 'Acceptată',
    color: 'text-[#06b6d4]',
    bg: 'bg-[#06b6d4]/10',
    border: 'border-[#06b6d4]/30',
    next: 'PREPARING',
    prev: null,
  },
  PREPARING: {
    label: 'În Preparare',
    color: 'text-status-preparing',
    bg: 'bg-status-preparing/10',
    border: 'border-status-preparing/30',
    next: 'READY',
    prev: null,
  },
  READY: {
    label: 'Gata',
    color: 'text-status-ready',
    bg: 'bg-status-ready/10',
    border: 'border-status-ready/30',
    next: 'PICKED_UP',
    prev: 'PREPARING',
  },
  PICKED_UP: {
    label: 'Ridicată',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    next: null,
    prev: 'READY',
  },
  CANCELLED: {
    label: 'Anulată',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    next: null,
    prev: null,
  },
};

export function OrderCardMobile({ order, index }: OrderCardMobileProps) {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(order.createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(order.createdAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const config = statusConfig[order.status];
  const isNew = order.status === 'RECEIVED';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`bg-bg-card border ${config.border} rounded-xl p-4 mb-3 ${
        isNew ? 'animate-pulse-new' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg ${config.bg}`}>
            <span className={`text-base font-bold ${config.color}`}>
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{timeAgo}</span>
          </div>
        </div>
        <span className="text-base font-bold text-text-primary">
          {order.total} lei
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm font-semibold text-status-preparing min-w-[20px]">
              {item.quantity}x
            </span>
            <span className="text-sm text-text-primary">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Customer Details */}
      <div className="space-y-1 mb-3 p-2 bg-bg-primary/50 rounded-lg">
        <div className="flex items-center gap-2 text-text-secondary">
          <User className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-sm font-medium">{order.customerName}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <Phone className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs">{order.phone}</span>
        </div>
        {order.pickupTime && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted">Ridicare: {order.pickupTime}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {(() => {
            const pm = paymentConfig[order.paymentMethod] || paymentConfig.cash;
            const Icon = pm.icon;
            return (
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${pm.bg}`}>
                <Icon className={`w-3 h-3 ${pm.color}`} />
                <span className={`text-[10px] font-medium ${pm.color}`}>{pm.label}</span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Notes / Allergies */}
      {(order.notes || order.allergies) && (
        <div className="mb-3 p-2 bg-status-preparing/5 border border-status-preparing/20 rounded-lg">
          {order.allergies && (
            <div className="flex items-center gap-1.5 text-status-new mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{order.allergies}</span>
            </div>
          )}
          {order.notes && (
            <span className="text-xs text-text-muted">{order.notes}</span>
          )}
        </div>
      )}

      {/* Action Buttons - Touch Friendly */}
      <div className="flex gap-2 pt-2 border-t border-border-subtle">
        {/* Cancel button - only show for RECEIVED and PREPARING orders */}
        {(order.status === 'RECEIVED' || order.status === 'PREPARING') && (
          <CancelButtonMobile order={order} />
        )}
        {config.prev && (
          <StatusButton direction="prev" order={order} />
        )}
        {config.next && (
          <StatusButton direction="next" order={order} />
        )}
      </div>
    </motion.div>
  );
}

function StatusButton({
  direction,
  order,
}: {
  direction: 'next' | 'prev';
  order: Order;
}) {
  const updateOrderStatus = useKDSStore((s) => s.updateOrderStatus);
  const [loading, setLoading] = useState(false);
  const config = statusConfig[order.status];
  const nextStatus = direction === 'next' ? config.next : config.prev;

  if (!nextStatus) return null;

  const nextConfig = statusConfig[nextStatus];

  const handleClick = async () => {
    setLoading(true);
    try {
      await client.patch(`/orders/${order.id}/status`, { status: nextStatus });
      updateOrderStatus(order.id, nextStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={loading}
      className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
        direction === 'next'
          ? `${nextConfig.bg} ${nextConfig.color}`
          : 'bg-border-subtle text-text-muted'
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {direction === 'prev' && <ChevronLeft className="w-4 h-4" />}
          <span>{direction === 'next' ? nextConfig.label : 'Înapoi'}</span>
          {direction === 'next' && <ChevronRight className="w-4 h-4" />}
        </>
      )}
    </motion.button>
  );
}

function CancelButtonMobile({ order }: { order: Order }) {
  const updateOrderStatus = useKDSStore((s) => s.updateOrderStatus);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await client.patch(`/orders/${order.id}/status`, { status: 'CANCELLED' });
      updateOrderStatus(order.id, 'CANCELLED');
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1 flex-1">
        <span className="text-xs text-red-400">Sigur?</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 flex-1"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Da</span>
            </>
          )}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowConfirm(false)}
          className="px-2 py-3 rounded-lg text-xs font-medium bg-border-subtle text-text-muted hover:bg-bg-card-hover flex-1"
        >
          Nu
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setShowConfirm(true)}
      className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex-1"
    >
      <X className="w-4 h-4" />
      <span>Anulează</span>
    </motion.button>
  );
}
