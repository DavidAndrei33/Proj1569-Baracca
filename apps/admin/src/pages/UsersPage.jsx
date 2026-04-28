import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Pencil, Trash2, Mail, Phone, Calendar, Shield, X, Check, User, Loader2, Lock } from 'lucide-react';
import client from '../api/client';

const ROLES = [
  { key: 'CUSTOMER', label: 'Client', color: 'bg-blue-100 text-blue-700' },
  { key: 'KITCHEN', label: 'Bucătărie', color: 'bg-amber-100 text-amber-700' },
  { key: 'ADMIN', label: 'Admin', color: 'bg-red-100 text-red-700' },
  { key: 'SUPERADMIN', label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'customer', password: '' });
  const [loading, setLoading] = useState(true);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinUser, setPinUser] = useState(null);
  const [pinValue, setPinValue] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await client.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAdd = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', role: 'customer', password: '' });
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', role: user.role || 'customer', password: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Sigur vrei să ștergi acest utilizator?')) return;
    try {
      setActionLoading(true);
      await client.delete(`/auth/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert(err.response?.data?.message || 'Eroare la ștergere');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    try {
      setActionLoading(true);
      await client.patch(`/auth/users/${id}/status`, { active: !user.active });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;

    try {
      setActionLoading(true);
      if (editingUser) {
        const res = await client.put(`/auth/users/${editingUser.id}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
        });
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.data : u)));
      } else {
        const res = await client.post('/auth/register', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          password: form.password,
        });
        setUsers((prev) => [res.data.user || res.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save user:', err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Eroare la salvare');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (!pinValue || pinValue.length < 4) {
      alert('PIN-ul trebuie să aibă minim 4 caractere');
      return;
    }
    try {
      setActionLoading(true);
      await client.put(`/auth/users/${pinUser.id}/pin`, { pin: pinValue });
      setPinModalOpen(false);
      setPinValue('');
      alert('PIN-ul a fost schimbat cu succes!');
    } catch (err) {
      console.error('Failed to change PIN:', err);
      alert(err.response?.data?.message || 'Eroare la schimbarea PIN-ului');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleConfig = (roleKey) => ROLES.find((r) => r.key === roleKey) || ROLES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Utilizatori</h1>
          <p className="text-text-muted mt-1">Gestionează utilizatorii platformei</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          Adaugă Utilizator
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role.key).length;
          return (
            <div key={role.key} className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.color}`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary">{count}</p>
                  <p className="text-xs text-text-muted">{role.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Caută după nume, email sau telefon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                roleFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-50 text-text-secondary border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Toți
            </button>
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRoleFilter(r.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  roleFilter === r.key ? 'bg-primary text-white' : 'bg-gray-50 text-text-secondary border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-text-muted">Se încarcă utilizatorii...</span>
        </div>
      )}

      {!loading && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Utilizator</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Rol</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Comenzi</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const roleConfig = getRoleConfig(user.role);
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{user.name}</p>
                            <p className="text-xs text-text-muted flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {user.registeredAt || user.createdAt?.split('T')[0] || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-text-secondary flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email}
                          </p>
                          <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                            <Phone className="w-3.5 h-3.5" />
                            {user.phone || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-text-primary">{user.orders || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          disabled={actionLoading}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                            user.active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {user.active ? 'Activ' : 'Inactiv'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setPinUser(user); setPinValue(''); setPinModalOpen(true); }}
                            className="p-2 rounded-lg hover:bg-amber-50 text-text-muted hover:text-amber-600 transition-colors"
                            title="Schimbă PIN"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading}
                            className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-text-muted/30 mb-3" />
              <p className="text-text-muted">Niciun utilizator găsit</p>
            </div>
          )}
        </div>
      )}

      {/* PIN Modal */}
      <AnimatePresence>
        {pinModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setPinModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-text-primary">Schimbă PIN</h2>
                <button
                  onClick={() => setPinModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-text-muted">
                  Setează PIN nou pentru <strong>{pinUser?.name}</strong> ({pinUser?.email})
                </p>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">PIN nou</label>
                  <input
                    type="text"
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="1234"
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <p className="text-xs text-text-muted mt-1">Minim 4 cifre, maxim 10</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setPinModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleChangePin}
                  disabled={actionLoading || pinValue.length < 4}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Schimbă PIN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingUser ? 'Editează Utilizator' : 'Utilizator Nou'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Nume complet *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ion Popescu"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ion@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Telefon</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="07xx xxx xxx"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Parolă *</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Minim 8 caractere"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingUser ? 'Salvează' : 'Creează'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
