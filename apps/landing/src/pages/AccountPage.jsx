import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, MapPin, Phone, Mail, Package, Clock, CheckCircle, Truck, ChevronRight, Loader2 } from 'lucide-react';
import client from '../api/client';

const statusConfig = {
  RECEIVED: { label: 'Nouă', color: 'bg-red-500/20 text-red-400', icon: Package },
  PREPARING: { label: 'În preparare', color: 'bg-[#f59e0b]/20 text-[#fbbf24]', icon: Clock },
  READY: { label: 'Gata', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  OUT_FOR_DELIVERY: { label: 'În livrare', color: 'bg-[#8b5cf6]/20 text-[#a78bfa]', icon: Truck },
  DELIVERED: { label: 'Livrată', color: 'bg-white/10 text-white/60', icon: CheckCircle },
};

function AccountPage() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await client.get('/orders/me');
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Nu am putut încărca comenzile.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-cinzel font-bold text-[#fbbf24] mb-4">Intră în cont</h1>
          <p className="text-white/60 mb-6">Trebuie să fii autentificat pentru a vedea contul</p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] px-6 py-3 rounded-xl font-semibold hover:shadow-[0_10px_40px_rgba(245,158,11,0.3)] transition-shadow">
              Login
            </Link>
            <Link to="/inregistrare" className="border-2 border-[#f59e0b] text-[#fbbf24] px-6 py-3 rounded-xl font-semibold hover:bg-[#f59e0b]/10 transition-colors">
              Creează cont
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0e] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-[#12121a] rounded-3xl border border-white/[0.06] p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#f59e0b]/10 rounded-2xl flex items-center justify-center border border-[#f59e0b]/20">
                <User className="w-8 h-8 text-[#fbbf24]" />
              </div>
              <div>
                <h1 className="text-2xl font-cinzel font-bold text-[#fbbf24]">{user?.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-white/60 text-sm flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user?.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {user?.phone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 text-red-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Ieșire</span>
            </button>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-cinzel font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#f59e0b]" />
              Adresele mele
            </h2>
            <div className="bg-[#0a0a0e] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-white/60 text-sm">Str. Principală 10, Moinești, 605400</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[#12121a] rounded-3xl border border-white/[0.06] p-8">
          <h2 className="text-xl font-cinzel font-bold text-[#fbbf24] mb-6">Comenzile mele</h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#f59e0b] animate-spin" />
              <span className="ml-3 text-white/50">Se încarcă comenzile...</span>
            </div>
          )}

          {error && !loading && (
            <p className="text-red-400 text-center py-8">{error}</p>
          )}

          {!loading && !error && orders.length === 0 && (
            <p className="text-white/50 text-center py-8">Nu ai plasat nicio comandă încă.</p>
          )}

          <div className="space-y-4">
            {!loading && orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.RECEIVED;
              const StatusIcon = status.icon;
              const itemNames = order.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ') || '';
              return (
                <Link
                  key={order.id}
                  to={`/comanda/${order.id}`}
                  className="block bg-[#0a0a0e] rounded-2xl p-5 border border-white/[0.06] hover:border-[#f59e0b]/30 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#fbbf24]">#{order.id}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30" />
                  </div>
                  <p className="text-white/60 text-sm mb-2">{itemNames}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">{formatDate(order.createdAt)}</span>
                    <span className="text-lg font-bold text-[#fbbf24]">{order.total} lei</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
