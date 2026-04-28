import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Loader2,
  X,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  CreditCard,
  Package as PackageIcon,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard.jsx';
import client from '../api/client';

const statusColors = {
  RECEIVED: 'bg-red-100 text-red-700',
  PREPARING: 'bg-amber-100 text-amber-700',
  READY: 'bg-green-100 text-green-700',
  PICKED_UP: 'bg-cyan-100 text-cyan-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
};

const statusLabels = {
  RECEIVED: 'Nouă',
  PREPARING: 'În preparare',
  READY: 'Gata de ridicare',
  PICKED_UP: 'Ridicată',
  CANCELLED: 'Anulată',
  ACCEPTED: 'Acceptată',
};

// Order Details Modal Component
function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Comanda #{order.id}</h2>
                <p className="text-sm text-text-muted mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-secondary">Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status] || statusColors.RECEIVED}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              {/* Customer Info */}
              <div className="card p-4 space-y-3">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Informații Client
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-primary">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-primary">{order.customerPhone}</span>
                  </div>
                  {order.pickupTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-primary">Ridicare: {order.pickupTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="card p-4">
                <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <PackageIcon className="w-4 h-4 text-primary" />
                  Produse comandate
                </h3>
                <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <span className="text-sm text-text-primary">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {Number(item.price) * item.quantity} lei
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                  <span className="font-semibold text-text-primary">Total</span>
                  <span className="text-lg font-bold text-primary">{order.total} lei</span>
                </div>
              </div>

              {/* Payment & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-4">
                  <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Plată
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {order.paymentMethod === 'cash' ? 'Numerar la ridicare' : 
                     order.paymentMethod === 'card' ? 'Card POS la ridicare' : 
                     order.paymentMethod || 'Numerar'}
                  </p>
                </div>
                <div className="card p-4">
                  <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Observații
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {order.notes || 'Fără observații'}
                  </p>
                </div>
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    Istoric Status
                  </h3>
                  <div className="space-y-3">
                    {order.statusHistory.map((history, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="text-text-muted">{formatDate(history.createdAt)}</span>
                        <span className="text-text-primary font-medium">
                          {statusLabels[history.status] || history.status}
                        </span>
                        {history.notes && (
                          <span className="text-text-muted text-xs">({history.notes})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    ordersToday: 0, 
    revenue: 0, 
    products: 0, 
    customers: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [weeklySales, setWeeklySales] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          client.get('/orders/stats'),
          client.get('/orders'),
          client.get('/products?all=true'),
        ]);
        
        const statsData = statsRes.data || {};
        const ordersData = ordersRes.data?.orders || ordersRes.data || [];
        const productsData = productsRes.data?.products || productsRes.data || [];
        
        // Calculate unique customers from all orders
        const uniqueCustomers = new Set(ordersData.map(o => o.customerPhone)).size;
        
        setStats({
          ordersToday: statsData.todayOrders || 0,
          revenue: statsData.todayRevenue || 0,
          products: productsData.length || 0,
          customers: uniqueCustomers || 0,
          totalOrders: statsData.totalOrders || 0,
          pendingOrders: statsData.pendingOrders || 0,
        });
        
        setWeeklySales(statsData.weeklySales || []);
        setRecentOrders(ordersData.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeOrderDetails = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted mt-1">Bine ai venit înapoi! Iată rezumatul zilei.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-text-muted">Se încarcă...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Comenzi Azi"
              value={stats.ordersToday}
              icon={ShoppingCart}
              trend={`${stats.totalOrders > 0 ? Math.round((stats.ordersToday / stats.totalOrders) * 100) : 0}%`}
              trendUp={true}
              color="primary"
            />
            <StatCard
              title="Venituri Azi (lei)"
              value={`${stats.revenue?.toLocaleString?.() || stats.revenue}`}
              icon={DollarSign}
              trend="8%"
              trendUp={true}
              color="secondary"
            />
            <StatCard
              title="Produse în Meniu"
              value={stats.products}
              icon={Package}
              trend=""
              trendUp={false}
              color="orange"
            />
            <StatCard
              title="Clienți Unici"
              value={stats.customers}
              icon={Users}
              trend=""
              trendUp={true}
              color="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="card p-6 lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-text-primary">Vânzări Săptămânale</h3>
                  <p className="text-sm text-text-muted">Ultimele 7 zile</p>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {stats.ordersToday > 0 ? '+' : ''}{stats.ordersToday} azi
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklySales.length > 0 ? weeklySales : [
                  { day: 'Lun', sales: 0 }, { day: 'Mar', sales: 0 }, { day: 'Mie', sales: 0 },
                  { day: 'Joi', sales: 0 }, { day: 'Vin', sales: 0 }, { day: 'Sâm', sales: 0 }, { day: 'Dum', sales: 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} lei`, 'Vânzări']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="sales" fill="#E63946" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="font-bold text-text-primary mb-4">Comenzi Recente</h3>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => openOrderDetails(order)}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{order.customerName}</p>
                      <p className="text-xs text-text-muted">#{order.id} • {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">{order.total} lei</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || statusColors.RECEIVED}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-text-muted text-sm text-center py-4">Nicio comandă recentă</p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder} 
        isOpen={modalOpen} 
        onClose={closeOrderDetails} 
      />
    </div>
  );
}
