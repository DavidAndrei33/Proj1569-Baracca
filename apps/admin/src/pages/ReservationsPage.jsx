import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, Mail, Search, Filter, CheckCircle, XCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import client from '../api/client';

const STATUS_BADGES = {
  PENDING: { label: 'Nouă', className: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Confirmată', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Anulată', className: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Finalizată', className: 'bg-blue-100 text-blue-700' },
  NO_SHOW: { label: 'No Show', className: 'bg-gray-100 text-gray-700' },
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReservations();
  }, [selectedDate, page]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/reservations?date=${selectedDate}&page=${page}&limit=20`);
      setReservations(res.data.data?.reservations || []);
    } catch (err) {
      console.error('Failed to fetch reservations', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await client.patch(`/reservations/${id}`, { status });
      fetchReservations();
    } catch (err) {
      console.error('Failed to update reservation', err);
    }
  };

  const filtered = reservations.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || r.customerName.toLowerCase().includes(q) || r.customerPhone.includes(q);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'PENDING').length,
    confirmed: reservations.filter((r) => r.status === 'CONFIRMED').length,
    guests: reservations.filter((r) => r.status !== 'CANCELLED' && r.status !== 'NO_SHOW').reduce((s, r) => s + r.numberOfGuests, 0),
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rezervări</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Rezervări totale</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Așteaptă confirmare</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-sm text-gray-500">Confirmate</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-blue-600">{stats.guests}</p>
          <p className="text-sm text-gray-500">Oaspeți așteptați</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
        <div className="flex items-center gap-2 flex-1">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Caută după nume sau telefon..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none">
          <option value="all">Toate statusurile</option>
          <option value="PENDING">Noi</option>
          <option value="CONFIRMED">Confirmate</option>
          <option value="COMPLETED">Finalizate</option>
          <option value="CANCELLED">Anulate</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data & Ora</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Persoane</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Masă</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Se încarcă...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nu există rezervări</td></tr>
              ) : (
                filtered.map((r) => {
                  const badge = STATUS_BADGES[r.status] || STATUS_BADGES.PENDING;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.customerName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {r.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 flex items-center gap-1"><Calendar size={14} /> {r.reservationDate?.split('T')[0]}</p>
                        <p className="text-sm text-gray-700 flex items-center gap-1"><Clock size={14} /> {r.reservationTime}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{r.numberOfGuests} persoane</span>
                        {r.tablePreference && <p className="text-xs text-gray-400">{r.tablePreference}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" defaultValue={r.tableNumber || ''}
                          onBlur={(e) => { if (e.target.value !== (r.tableNumber || '')) updateStatus(r.id, { ...r, tableNumber: e.target.value }); }}
                          className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:border-primary outline-none" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {r.status === 'PENDING' && (
                            <>
                              <button onClick={() => updateStatus(r.id, 'CONFIRMED')} className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100">Confirmă</button>
                              <button onClick={() => updateStatus(r.id, 'CANCELLED')} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Anulează</button>
                            </>
                          )}
                          {r.status === 'CONFIRMED' && (
                            <>
                              <button onClick={() => updateStatus(r.id, 'COMPLETED')} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Finalizată</button>
                              <button onClick={() => updateStatus(r.id, 'NO_SHOW')} className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">No Show</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
