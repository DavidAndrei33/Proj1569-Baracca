import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Armchair,
  Filter,
  Eye,
} from 'lucide-react';
import client from '../api/client';

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  COMPLETED: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  NO_SHOW: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusLabels = {
  PENDING: 'Nouă',
  CONFIRMED: 'Confirmată',
  CANCELLED: 'Anulată',
  COMPLETED: 'Finalizată',
  NO_SHOW: 'No-show',
};

const statusOptions = [
  { key: 'all', label: 'Toate' },
  { key: 'PENDING', label: 'Nouă' },
  { key: 'CONFIRMED', label: 'Confirmată' },
  { key: 'CANCELLED', label: 'Anulată' },
  { key: 'COMPLETED', label: 'Finalizată' },
  { key: 'NO_SHOW', label: 'No-show' },
];

const ITEMS_PER_PAGE = 10;

function ReservationModal({ reservation, isOpen, onClose, onUpdateStatus, updating }) {
  if (!reservation) return null;

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
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Rezervarea #{reservation.id}</h2>
                <p className="text-sm text-text-muted mt-0.5">{reservation.reservationDate} · {reservation.reservationTime}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-text-muted transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-secondary">Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[reservation.status]}`}>
                  {statusLabels[reservation.status]}
                </span>
              </div>

              <div className="card p-4 space-y-3">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Informații Client
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-primary">{reservation.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-primary">{reservation.customerPhone}</span>
                  </div>
                  {reservation.customerEmail && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Mail className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-primary">{reservation.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-4 space-y-3">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Detalii Rezervare
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-primary">{reservation.reservationDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-primary">{reservation.reservationTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-primary">{reservation.numberOfGuests} persoane</span>
                  </div>
                  {reservation.tablePreference && (
                    <div className="flex items-center gap-2">
                      <Armchair className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-primary">{reservation.tablePreference}</span>
                    </div>
                  )}
                  {reservation.tableNumber && (
                    <div className="flex items-center gap-2">
                      <Armchair className="w-4 h-4 text-primary" />
                      <span className="text-sm text-text-primary font-medium">Masa {reservation.tableNumber}</span>
                    </div>
                  )}
                  {reservation.occasion && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-preparing" />
                      <span className="text-sm text-text-primary capitalize">{reservation.occasion}</span>
                    </div>
                  )}
                </div>
                {reservation.specialRequests && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">{reservation.specialRequests}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {reservation.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => { onUpdateStatus(reservation.id, 'CONFIRMED'); onClose(); }}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmă rezervarea
                  </button>
                  <button
                    onClick={() => { onUpdateStatus(reservation.id, 'CANCELLED'); onClose(); }}
                    disabled={updating}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Respinge
                  </button>
                </div>
              )}

              {reservation.status === 'CONFIRMED' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => { onUpdateStatus(reservation.id, 'COMPLETED'); onClose(); }}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marchează finalizată
                  </button>
                  <button
                    onClick={() => { onUpdateStatus(reservation.id, 'NO_SHOW'); onClose(); }}
                    disabled={updating}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    No-show
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await client.get('/reservations');
      const data = res.data?.reservations || res.data || [];
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
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

  const openModal = (reservation) => {
    setSelectedReservation(reservation);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReservation(null);
  };

  const filtered = reservations.filter((r) => {
    const matchSearch =
      (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.id).includes(searchQuery);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchDate = !dateFilter || r.reservationDate === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const today = new Date().toISOString().split('T')[0];
  const todayCount = reservations.filter((r) => r.reservationDate === today).length;
  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Rezervări</h1>
        <p className="text-text-muted mt-1">Management rezervări mese</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{todayCount}</p>
            <p className="text-xs text-text-muted">Rezervări azi</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{pendingCount}</p>
            <p className="text-xs text-text-muted">Necesită confirmare</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{reservations.filter((r) => r.status === 'CONFIRMED').length}</p>
            <p className="text-xs text-text-muted">Confirmate</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Caută după nume sau ID..."
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
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-text-muted">Se încarcă rezervările...</span>
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
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Data & Ora</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Persoane</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((reservation, idx) => (
                  <motion.tr
                    key={reservation.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => openModal(reservation)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-primary">#{reservation.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{reservation.customerName}</p>
                        <p className="text-xs text-text-muted">{reservation.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary">{reservation.reservationDate}</p>
                      <p className="text-xs text-text-muted">{reservation.reservationTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">{reservation.numberOfGuests} pers.</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[reservation.status] || statusColors.PENDING}`}>
                        {statusLabels[reservation.status] || reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {reservation.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatus(reservation.id, 'CONFIRMED')}
                              disabled={updating === reservation.id}
                              className="px-2 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              {updating === reservation.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmă'}
                            </button>
                            <button
                              onClick={() => updateStatus(reservation.id, 'CANCELLED')}
                              disabled={updating === reservation.id}
                              className="px-2 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              Respinge
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openModal(reservation)}
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
              <p className="text-text-muted">Nicio rezervare găsită</p>
            </div>
          )}

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

      <ReservationModal
        reservation={selectedReservation}
        isOpen={modalOpen}
        onClose={closeModal}
        onUpdateStatus={updateStatus}
        updating={updating}
      />
    </div>
  );
}
