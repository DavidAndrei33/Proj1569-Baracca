import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Clock, ChefHat, ShoppingBag, Phone, Loader2 } from 'lucide-react';
import client from '../api/client';

const steps = [
  { id: 'RECEIVED', label: 'Comandă plasată', icon: Package },
  { id: 'PREPARING', label: 'În preparare', icon: ChefHat },
  { id: 'READY', label: 'Gata de ridicare', icon: CheckCircle },
  { id: 'PICKED_UP', label: 'Ridicată', icon: ShoppingBag },
];

const statusLabels = {
  RECEIVED: 'Nouă',
  ACCEPTED: 'Acceptată',
  PREPARING: 'În preparare',
  READY: 'Gata de ridicare',
  PICKED_UP: 'Ridicată',
  CANCELLED: 'Anulată',
};

const statusColors = {
  RECEIVED: 'bg-red-500/20 text-red-400',
  ACCEPTED: 'bg-[#06b6d4]/20 text-[#06b6d4]',
  PREPARING: 'bg-[#f59e0b]/20 text-[#fbbf24]',
  READY: 'bg-green-500/20 text-green-400',
  PICKED_UP: 'bg-white/10 text-white/60',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        setError('Nu am putut încărca detaliile comenzii.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const currentStepIndex = order ? steps.findIndex((s) => s.id === order.status) : -1;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" />
        <span className="ml-3 text-white/50">Se încarcă...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] py-8 px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-red-400 text-lg mb-4">{error || 'Comanda nu a fost găsită.'}</p>
          <Link to="/cont" className="text-[#fbbf24] hover:underline">Înapoi la comenzi</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/cont" className="inline-flex items-center gap-2 text-white/50 hover:text-[#fbbf24] text-sm mb-6 transition-colors">
          <ArrowLeft size={16} />
          Înapoi la comenzi
        </Link>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/50 text-sm">Comanda #{order.id}</p>
              <p className="text-white/30 text-xs">{formatDate(order.createdAt)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-white/10 text-white/60'}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>

          {/* Progress steps */}
          <div className="relative mt-8 mb-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? isCurrent
                            ? 'bg-[#f59e0b] text-[#020204] shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                            : 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30'
                          : 'bg-white/5 text-white/30 border border-white/10'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] mt-2 font-medium ${isActive ? 'text-white/70' : 'text-white/30'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 -z-0">
              <div
                className="h-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="font-cinzel font-semibold text-white mb-4">Produse comandate</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm">{item.quantity}x</span>
                  <span className="text-white text-sm">{item.name}</span>
                </div>
                <span className="text-[#fbbf24] text-sm font-medium">{Number(item.price) * item.quantity} lei</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-[#fbbf24] font-bold text-lg">{Number(order.total)} lei</span>
          </div>
        </div>

        {/* Status history */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="font-cinzel font-semibold text-white mb-4">Istoric status</h3>
            <div className="space-y-3">
              {order.statusHistory.map((event, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span className="text-white/60 text-sm">{statusLabels[event.status] || event.status}</span>
                  <span className="text-white/30 text-xs ml-auto">{formatDate(event.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.pickupTime && (
          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-2xl p-4 mt-6 flex items-center gap-3">
            <Clock size={20} className="text-[#fbbf24]" />
            <div>
              <p className="text-white text-sm font-medium">Ora ridicare: {order.pickupTime}</p>
              <p className="text-white/50 text-xs">Strada Plopilor 2c, Moinești</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTrackingPage;
