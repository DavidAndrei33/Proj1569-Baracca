import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { useKDSStore } from '../store';
import { OrderCardMobile } from './OrderCardMobile';
import type { OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  RECEIVED: { label: 'Comenzi Noi', color: 'text-status-new' },
  ACCEPTED: { label: 'Acceptate', color: 'text-[#06b6d4]' },
  PREPARING: { label: 'În Preparare', color: 'text-status-preparing' },
  READY: { label: 'Gata', color: 'text-status-ready' },
  PICKED_UP: { label: 'Ridicate', color: 'text-cyan-400' },
  CANCELLED: { label: 'Anulate', color: 'text-red-400' },
};

const statuses: OrderStatus[] = ['RECEIVED', 'PREPARING', 'READY', 'PICKED_UP', 'CANCELLED'];

export function MobileOrderList() {
  const { orders, activeFilter, setActiveFilter } = useKDSStore();

  const currentIndex = statuses.indexOf(activeFilter === 'all' ? 'RECEIVED' : activeFilter);

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter((o) => o.status === activeFilter);

  const goToPrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    setActiveFilter(statuses[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex < statuses.length - 1 ? currentIndex + 1 : statuses.length - 1;
    setActiveFilter(statuses[newIndex]);
  };

  const currentStatus = activeFilter === 'all' ? 'RECEIVED' : activeFilter;
  const config = statusConfig[currentStatus];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-card border-b border-border-subtle">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className={`p-2 rounded-lg ${currentIndex === 0 ? 'opacity-30' : 'active:bg-border-subtle'}`}
        >
          <ChevronLeft className="w-6 h-6 text-text-primary" />
        </motion.button>

        <div className="text-center">
          <h2 className={`text-lg font-bold ${config.color}`}>
            {config.label}
          </h2>
          <span className="text-sm text-text-muted">
            {filteredOrders.length} comenzi
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goToNext}
          disabled={currentIndex === statuses.length - 1}
          className={`p-2 rounded-lg ${currentIndex === statuses.length - 1 ? 'opacity-30' : 'active:bg-border-subtle'}`}
        >
          <ChevronRight className="w-6 h-6 text-text-primary" />
        </motion.button>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-text-muted"
            >
              <ClipboardList className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-base font-medium">Nu există comenzi</p>
              <p className="text-sm text-text-muted mt-1">Comenzile vor apărea aici</p>
            </motion.div>
          ) : (
            filteredOrders.map((order, index) => (
              <OrderCardMobile key={order.id} order={order} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-1.5 py-3 bg-bg-card border-t border-border-subtle overflow-x-auto px-4">
        {statuses.map((status, idx) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex 
                ? status === 'RECEIVED' ? 'bg-status-new w-4' 
                  : status === 'PREPARING' ? 'bg-status-preparing w-4'
                  : status === 'READY' ? 'bg-status-ready w-4'
                  : status === 'PICKED_UP' ? 'bg-cyan-400 w-4'
                  : 'bg-red-400 w-4'
                : 'bg-border-subtle'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
