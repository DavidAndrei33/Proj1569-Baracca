import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Eye, Loader2, ChevronDown, X, MapPin, Phone, User, Calendar, Clock, CreditCard, Package } from 'lucide-react';
import client from '../api/client';

const statusColors = {
  RECEIVED: 'bg-red-100 text-red-700 border-red-200',
  PREPARING: 'bg-amber-100 text-amber-700 border-amber-200',
  READY: 'bg-green-100 text-green-700 border-green-200',
  PICKED_UP: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels = {
  RECEIVED: 'Nouă',
  PREPARING: 'În preparare',
  READY: 'Gata de ridicare',
  PICKED_UP: 'Ridicată',
  CANCELLED: 'Anulată',
};

const statusOptions = [
  { key: 'all', label: 'Toate' },
  { key: 'RECEIVED', label: 'Nouă' },
  { key: 'PREPARING', label: 'În preparare' },
  { key: 'READY', label: 'Gata de ridicare' },
  { key: 'PICKED_UP', label: 'Ridicată' },
  { key: 'CANCELLED', label: 'Anulate' },
];

const ITEMS_PER_PAGE = 10;

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
                  <Package className="w-4 h-4 text-primary" />
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await client.get('/orders');
      // FIX: Parse { orders: [...], pagination: {...} }
      const ordersData = res.data?.orders || res.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      await client.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Refresh orders
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeOrderDetails = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(o.id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Comenzi</h1>
        <p className="text-text-muted mt-1">Istoricul tuturor comenzilor</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Caută după client sau ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statusOptions.map((s) => (
              <button
                key={s.key}
                onClick={() => { setStatusFilter(s.key); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === s.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 text-text-secondary border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-text-muted">Se încarcă comenzile...</span>
        </div>
      )}

      {!loading && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Produse</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Data</th>
                  <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => openOrderDetails(order)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-primary">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{order.customerName}</p>
                        <p className="text-xs text-text-muted">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-sm text-text-secondary">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-text-muted">+{order.items.length - 2} altele</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-text-primary">{order.total} lei</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || statusColors.RECEIVED}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ro-RO') : ''}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {/* Cancel Button - for RECEIVED and PREPARING orders */}
                        {(order.status === 'RECEIVED' || order.status === 'PREPARING') && (
                          <CancelButton 
                            orderId={order.id} 
                            onCancel={() => updateStatus(order.id, 'CANCELLED')}
                            updating={updating === order.id}
                          />
                        )}
                        
                        {/* Status Update Dropdown */}
                        {order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && (
                          <div className="relative group">
                            <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                              Update
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              {statusOptions.filter(s => s.key !== 'all' && s.key !== order.status && s.key !== 'CANCELLED').map((s) => (
                                <button
                                  key={s.key}
                                  onClick={() => updateStatus(order.id, s.key)}
                                  disabled={updating === order.id}
                                  className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50"
                                >
                                  {updating === order.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                                  ) : null}
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <button 
                          onClick={() => openOrderDetails(order)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginated.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted">Nicio comandă găsită</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-text-muted">
                Afișare {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} din {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 hover:bg-gray-50 text-text-secondary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
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

// Cancel Button Component with confirmation
function CancelButton({ orderId, onCancel, updating }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-600 font-medium">Sigur?</span>
        <button
          onClick={() => {
            onCancel();
            setShowConfirm(false);
          }}
          disabled={updating}
          className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Da'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-2 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition-colors"
        >
          Nu
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-medium hover:bg-red-200 transition-colors"
      title="Anulează comanda"
    >
      <X className="w-3.5 h-3.5" />
      <span>Anulează</span>
    </button>
  );
}
