import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Armchair,
  Plus,
  Loader2,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import client from '../api/client';

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 2,
    location: 'interior',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await client.get('/tables');
      const data = res.data?.tables || res.data || [];
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTable(null);
    setFormData({ tableNumber: '', capacity: 2, location: 'interior', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location || 'interior',
      isActive: table.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTable) {
        await client.patch(`/tables/${editingTable.id}`, formData);
      } else {
        await client.post('/tables', formData);
      }
      setShowModal(false);
      fetchTables();
    } catch (err) {
      console.error('Failed to save table:', err);
      alert(err.response?.data?.error || 'Eroare la salvare');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/tables/${id}`);
      setDeleteConfirm(null);
      fetchTables();
    } catch (err) {
      console.error('Failed to delete table:', err);
      alert(err.response?.data?.error || 'Eroare la ștergere');
    }
  };

  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
  const activeTables = tables.filter((t) => t.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mese</h1>
          <p className="text-text-muted mt-1">Management mese restaurant</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adaugă masă
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Armchair className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{tables.length}</p>
            <p className="text-xs text-text-muted">Total mese</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{activeTables}</p>
            <p className="text-xs text-text-muted">Active</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Armchair className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{totalCapacity}</p>
            <p className="text-xs text-text-muted">Capacitate totală</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-text-muted">Se încarcă...</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card p-5 ${!table.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    table.isActive ? 'bg-primary/10' : 'bg-gray-100'
                  }`}>
                    <Armchair className={`w-6 h-6 ${table.isActive ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">Masa {table.tableNumber}</h3>
                    <p className="text-xs text-text-muted capitalize">{table.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(table)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(table.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Capacitate</span>
                  <span className="font-medium text-text-primary">{table.capacity} persoane</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Status</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    table.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {table.isActive ? 'Activă' : 'Inactivă'}
                  </span>
                </div>
              </div>

              {deleteConfirm === table.id && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">Sigur dorești să ștergi această masă?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      Șterge
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {tables.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Armchair className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted text-lg">Nicio masă configurată</p>
              <p className="text-text-muted text-sm mt-1">Adaugă prima masă folosind butonul de mai sus</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-text-primary">
                {editingTable ? 'Editează masa' : 'Adaugă masă nouă'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Număr masă *</label>
                <input
                  required
                  type="text"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  placeholder="Ex: 1, T1, V1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Capacitate *</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={50}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Locație</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="interior">Interior</option>
                  <option value="terasa">Terasă</option>
                  <option value="etaj">Etaj</option>
                  <option value="bar">Bar</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm text-text-secondary">Masă activă</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-text-secondary rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTable ? 'Salvează' : 'Adaugă'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
