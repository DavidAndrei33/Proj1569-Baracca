import React, { useState, useEffect } from 'react';
import { Plus, Armchair, MapPin, Users, Pencil, Trash2, CheckCircle } from 'lucide-react';
import client from '../api/client';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({ tableNumber: '', capacity: 4, location: 'interior' });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await client.get('/tables');
      setTables(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tables', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await client.patch(`/tables/${editingTable.id}`, formData);
      } else {
        await client.post('/tables', formData);
      }
      setShowForm(false);
      setEditingTable(null);
      setFormData({ tableNumber: '', capacity: 4, location: 'interior' });
      fetchTables();
    } catch (err) {
      console.error('Failed to save table', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Sigur vrei să ștergi această masă?')) return;
    try {
      await client.delete(`/tables/${id}`);
      fetchTables();
    } catch (err) {
      console.error('Failed to delete table', err);
    }
  };

  const startEdit = (table) => {
    setEditingTable(table);
    setFormData({ tableNumber: table.tableNumber, capacity: table.capacity, location: table.location });
    setShowForm(true);
  };

  const locationLabels = {
    interior: 'Interior',
    terasa: 'Terasă',
    geam: 'Lângă geam',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Management Mese</h1>
        <button
          onClick={() => { setShowForm(true); setEditingTable(null); setFormData({ tableNumber: '', capacity: 4, location: 'interior' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Adaugă masă
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
          <p className="text-sm text-gray-500">Mese totale</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-blue-600">
            {tables.filter((t) => t.location === 'interior').length}
          </p>
          <p className="text-sm text-gray-500">Interior</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-green-600">
            {tables.filter((t) => t.location === 'terasa').length}
          </p>
          <p className="text-sm text-gray-500">Terasă</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-amber-600">
            {tables.reduce((sum, t) => sum + t.capacity, 0)}
          </p>
          <p className="text-sm text-gray-500">Capacitate totală</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTable ? 'Editează masă' : 'Adaugă masă nouă'}
          </h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Număr masă *</label>
              <input required value={formData.tableNumber}
                onChange={(e) => setFormData((p) => ({ ...p, tableNumber: e.target.value }))}
                placeholder="Ex: M1"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacitate *</label>
              <input required type="number" min={1} max={20} value={formData.capacity}
                onChange={(e) => setFormData((p) => ({ ...p, capacity: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locație *</label>
              <select value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none">
                <option value="interior">Interior</option>
                <option value="terasa">Terasă</option>
                <option value="geam">Lângă geam</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                {editingTable ? 'Salvează' : 'Adaugă'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Anulează
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables grid */}
      {loading ? (
        <p className="text-gray-400 text-center py-12">Se încarcă...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const todayReservations = table.reservations?.filter(
              (r) => r.status === 'PENDING' || r.status === 'CONFIRMED'
            ) || [];
            const isOccupied = todayReservations.length > 0;

            return (
              <div key={table.id}
                className={`bg-white rounded-xl border p-5 transition-all ${
                  isOccupied ? 'border-amber-300 shadow-sm' : 'border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Armchair size={20} className={isOccupied ? 'text-amber-500' : 'text-gray-400'} />
                    <span className="font-bold text-lg text-gray-900">{table.tableNumber}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(table)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(table.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span>Capacitate: {table.capacity} persoane</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{locationLabels[table.location] || table.location}</span>
                  </div>
                </div>

                {todayReservations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-amber-600 mb-1">Rezervări astăzi:</p>
                    {todayReservations.map((r) => (
                      <p key={r.id} className="text-xs text-gray-500">
                        {r.reservationTime} — {r.customerName} ({r.numberOfGuests} pers.)
                      </p>
                    ))}
                  </div>
                )}

                {isOccupied && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-amber-600">
                    <CheckCircle size={12} />
                    <span>Ocupată</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
