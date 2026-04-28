import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  ChefHat,
  Package,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  XCircle,
  Calendar,
  Users,
} from 'lucide-react';
import { useKDSStore } from '../store';
import { formatTime } from '../utils/time';
import { useEffect, useState } from 'react';

interface HeaderProps {
  activeTab: 'orders' | 'reservations';
  onTabChange: (tab: 'orders' | 'reservations') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { orders, toggleSound, soundEnabled } = useKDSStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
    window.location.reload();
  };

  const newCount = orders.filter((o) => o.status === 'RECEIVED').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const pickedUpCount = orders.filter((o) => o.status === 'PICKED_UP').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length;

  const stats = [
    {
      label: 'Comenzi Noi',
      value: newCount,
      icon: Package,
      color: 'text-status-new',
      bg: 'bg-status-new/10',
    },
    {
      label: 'În Preparare',
      value: preparingCount,
      icon: ChefHat,
      color: 'text-status-preparing',
      bg: 'bg-status-preparing/10',
    },
    {
      label: 'Gata',
      value: readyCount,
      icon: CheckCircle2,
      color: 'text-status-ready',
      bg: 'bg-status-ready/10',
    },
    {
      label: 'Ridicate',
      value: pickedUpCount,
      icon: ShoppingBag,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
    },
    {
      label: 'Anulate',
      value: cancelledCount,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
  ];

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="bg-bg-card border-b border-border-subtle px-4 md:px-6 py-3 md:py-4"
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 md:p-2 bg-status-preparing/10 rounded-lg md:rounded-xl">
            <ChefHat className="w-5 h-5 md:w-7 md:h-7 text-status-preparing" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-bold text-text-primary">
              Pizzeria Baracca
            </h1>
            <p className="text-[10px] md:text-xs text-text-muted">Kitchen Display System</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-bg-primary rounded-xl p-1 border border-border-subtle">
          <button
            onClick={() => onTabChange('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-status-preparing/20 text-status-preparing'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span className="flex items-center gap-2">
              <Package size={16} />
              Comenzi
            </span>
          </button>
          <button
            onClick={() => onTabChange('reservations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'reservations'
                ? 'bg-status-preparing/20 text-status-preparing'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              Rezervări
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-2 rounded-lg md:rounded-xl bg-border-subtle hover:bg-bg-card-hover transition-colors"
            title="Reîmprospătare"
          >
            <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSound}
            className={`p-2 rounded-lg md:rounded-xl transition-colors ${
              soundEnabled
                ? 'bg-status-ready/10 hover:bg-status-ready/20'
                : 'bg-border-subtle hover:bg-bg-card-hover'
            }`}
            title={soundEnabled ? 'Sunet activat' : 'Sunet dezactivat'}
          >
            {soundEnabled ? (
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-status-ready" />
            ) : (
              <BellOff className="w-4 h-4 md:w-5 md:h-5 text-text-muted" />
            )}
          </motion.button>

          <div className="text-right ml-1 md:ml-2">
            <div className="text-xl md:text-3xl font-bold text-text-primary tabular-nums tracking-tight">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-bg-primary border border-border-subtle rounded-xl p-2 md:p-3 flex items-center gap-2 md:gap-3"
            >
              <div className={`p-1 md:p-1.5 rounded-md md:rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm md:text-base font-bold text-text-primary truncate">
                  {stat.value}
                </div>
                <div className="text-[9px] md:text-[10px] text-text-muted truncate">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="flex items-center gap-4 text-text-muted text-sm">
          <span className="flex items-center gap-2">
            <Calendar size={16} className="text-status-preparing" />
            Rezervări
          </span>
          <span className="flex items-center gap-2">
            <Users size={16} className="text-status-ready" />
            Management mese
          </span>
        </div>
      )}
    </motion.header>
  );
}
