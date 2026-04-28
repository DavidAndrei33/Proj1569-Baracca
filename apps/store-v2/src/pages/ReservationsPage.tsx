import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Search,
  Armchair,
} from 'lucide-react';
import { useKDSStore } from '../store';
import client from '../api/client';
import type { Reservation, ReservationStatus } from '../types';

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING: {
    label: 'Nouă',
    color: 'text-status-new',
    bg: 'bg-status-new/10',
    border: 'border-status-new/30',
  },
  CONFIRMED: {
    label: 'Confirmată',
    color: 'text-status-ready',
    bg: 'bg-status-ready/10',
    border: 'border-status-ready/30',
  },
  CANCELLED: {
    label: 'Anulată',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
  },
  COMPLETED: {
    label: 'Finalizată',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
  },
  NO_SHOW: {
    label: 'No-show',
    color: 'text-text-muted',
    bg: 'bg-text-muted/10',
    border: 'border-text-muted/30',
  },
};

export default function ReservationsPage() {
  const { reservations, setReservations } = useKDSStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await client.get('/reservations');
      const data = res.data?.reservations || res.data || [];
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: ReservationStatus) => {
    try {
      setUpdating(id);
      await client.patch(`/reservations/${id}/status`, { status });
      fetchReservations();
    } catch (err) {
      console.error('Failed to update reservation status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = reservations.filter((r) => {
    const matchSearch =
      (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.id).includes(searchQuery);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchDate = !dateFilter || r.reservationDate === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });

  const today = new Date().toISOString().split('T')[0];
  const todayReservations = filtered.filter((r) => r.reservationDate === today);

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-border-subtle">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Caută după nume sau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-status-preparing/20 focus:border-status-preparing/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
              className="px-4 py-2.5 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-status-preparing/20"
            >
              <option value="all">Toate statusurile</option>
              <option value="PENDING">Nouă</option>
              <option value="CONFIRMED">Confirmată</option>
              <option value="CANCELLED">Anulată</option>
              <option value="COMPLETED">Finalizată</option>
              <option value="NO_SHOW">No-show</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-status-preparing/20"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="px-3 py-2.5 bg-bg-card border border-border-subtle rounded-xl text-text-muted hover:text-text-primary transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-status-new/10 border border-status-new/20 rounded-lg">
            <Calendar className="w-4 h-4 text-status-new" />
            <span className="text-sm text-text-primary">
              <strong>{todayReservations.length}</strong> rezervări azi
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-status-ready/10 border border-status-ready/20 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-status-ready" />
            <span className="text-sm text-text-primary">
              <strong>{reservations.filter((r) => r.status === 'CONFIRMED').length}</strong> confirmate
            </span>
          </div>
        </div>
      </div>

      {/* Reservations Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-status-preparing animate-spin" />
            <span className="ml-3 text-text-muted">Se încarcă rezervările...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-lg">Nicio rezervare găsită</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                updating={updating === reservation.id}
                onUpdateStatus={updateStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ReservationCard({
  reservation,
  updating,
  onUpdateStatus,
}: {
  reservation: Reservation;
  updating: boolean;
  onUpdateStatus: (id: number, status: ReservationStatus) => void;
}) {
  const config = statusConfig[reservation.status];
  const isPending = reservation.status === 'PENDING';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-bg-card border ${config.border} rounded-xl p-4 ${
        isPending ? 'animate-pulse-new' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${config.bg} ${config.color}`}>
            #{reservation.id}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs">{reservation.reservationDate}</span>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-text-primary">{reservation.customerName}</h3>
        <div className="flex items-center gap-3 mt-1 text-text-muted text-sm">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            {reservation.customerPhone}
          </span>
          {reservation.customerEmail && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {reservation.customerEmail}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3 p-2.5 bg-bg-primary/50 rounded-lg">
        <div className="flex items-center gap-2 text-text-secondary">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-sm">{reservation.reservationTime}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <Users className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-sm">{reservation.numberOfGuests} persoane</span>
        </div>
        {reservation.tablePreference && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Armchair className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-sm">{reservation.tablePreference}</span>
          </div>
        )}
        {reservation.tableNumber && (
          <div className="flex items-center gap-2 text-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-status-ready" />
            <span className="text-sm font-medium text-status-ready">Masa {reservation.tableNumber}</span>
          </div>
        )}
        {reservation.occasion && reservation.occasion !== 'casual' && (
          <div className="flex items-center gap-2 text-status-preparing">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-sm capitalize">{reservation.occasion}</span>
          </div>
        )}
      </div>

      {/* Special Requests */}
      {reservation.specialRequests && (
        <div className="mb-3 p-2 bg-status-preparing/5 border border-status-preparing/20 rounded-lg">
          <p className="text-xs text-text-muted">{reservation.specialRequests}</p>
        </div>
      )}

      {/* Actions */}
      {reservation.status === 'PENDING' && (
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateStatus(reservation.id, 'CONFIRMED')}
            disabled={updating}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-status-ready/10 text-status-ready rounded-lg text-xs font-medium hover:bg-status-ready/20 transition-colors disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Confirmă
          </button>
          <button
            onClick={() => onUpdateStatus(reservation.id, 'CANCELLED')}
            disabled={updating}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {reservation.status === 'CONFIRMED' && (
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateStatus(reservation.id, 'COMPLETED')}
            disabled={updating}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-400/10 text-cyan-400 rounded-lg text-xs font-medium hover:bg-cyan-400/20 transition-colors disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Finalizează
          </button>
          <button
            onClick={() => onUpdateStatus(reservation.id, 'NO_SHOW')}
            disabled={updating}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-text-muted/10 text-text-muted rounded-lg text-xs font-medium hover:bg-text-muted/20 transition-colors disabled:opacity-50"
          >
            No-show
          </button>
        </div>
      )}
    </motion.div>
  );
}
