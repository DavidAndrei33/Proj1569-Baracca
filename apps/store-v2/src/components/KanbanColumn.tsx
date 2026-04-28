import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import { OrderCard } from './OrderCard';

interface KanbanColumnProps {
  status: OrderStatus;
  title: string;
  textColor: string;
  bgColor: string;
  badgeBg: string;
  columnBg: string;
  orders: Order[];
}

export function KanbanColumn({ status: _status, title, textColor, bgColor, badgeBg, columnBg, orders }: KanbanColumnProps) {
  // Desktop Kanban always shows all orders in the column
  // Mobile filtering is handled by MobileOrderList component

  return (
    <div className={`flex flex-col h-full min-w-[340px] flex-1 rounded-2xl ${columnBg} border border-border-subtle/50`}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle/50">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${bgColor} shadow-lg shadow-current/30`} />
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            {title}
          </h2>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${textColor} ${badgeBg}`}>
          {orders.length}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-text-muted"
            >
              <ClipboardList className="w-14 h-14 mb-4 opacity-20" />
              <p className="text-sm font-medium">Nu există comenzi</p>
              <p className="text-xs text-text-muted mt-1">Comenzile vor apărea aici</p>
            </motion.div>
          ) : (
            orders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
