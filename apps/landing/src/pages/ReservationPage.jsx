import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Phone, Mail, UtensilsCrossed, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import client from '../api/client';

const OCCASIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'aniversare', label: 'Aniversare' },
  { value: 'afaceri', label: 'Întâlnire de afaceri' },
  { value: 'romantica', label: 'Cină romantică' },
  { value: 'familie', label: 'Masă în familie' },
  { value: 'alta', label: 'Altă ocazie' },
];

const TABLE_PREFERENCES = [
  { value: '', label: 'Fără preferință' },
  { value: 'interior', label: 'Interior' },
  { value: 'terasa', label: 'Terasă' },
  { value: 'geam', label: 'Lângă geam' },
];

const GUEST_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

function generateTimeSlots() {
  const slots = [];
  for (let h = 12; h <= 21; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export default function ReservationPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [reservationId, setReservationId] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    reservationDate: '',
    reservationTime: '',
    numberOfGuests: 2,
    tablePreference: '',
    occasion: 'casual',
    specialRequests: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await client.post('/reservations', formData);
      setReservationId(res.data.data.id);
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error || err.response?.data?.message || 'Eroare la trimiterea rezervării. Încearcă din nou.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] pt-32 pb-20 flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 60%)', filter: 'blur(60px)' }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-4 relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="font-cinzel font-bold text-2xl text-white mb-3 tracking-wide">Rezervare trimisă!</h1>
          <p className="text-white/50 mb-2">
            Mulțumim, <span className="text-[#fbbf24]">{formData.customerName}</span>!
          </p>
          <p className="text-white/50 mb-6">
            Rezervarea ta pentru <strong className="text-white">{formData.numberOfGuests} persoane</strong> la data de{' '}
            <strong className="text-white">{formData.reservationDate}</strong> ora{' '}
            <strong className="text-white">{formData.reservationTime}</strong> a fost primită.
          </p>
          <p className="text-white/40 text-sm mb-8">
            Număr rezervare: <span className="text-[#fbbf24] font-mono">#{reservationId}</span>
            <br />
            Vei fi contactat telefonic pentru confirmare.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] font-semibold rounded-xl shadow-[0_8px_30px_rgba(245,158,11,0.3)]"
            >
              Înapoi acasă
            </Link>
            <Link
              to="/meniu"
              className="px-8 py-3 border-2 border-[#f59e0b] text-[#fbbf24] font-semibold rounded-xl hover:bg-[#f59e0b]/10 transition-colors"
            >
              Vezi meniul
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-32 pb-20 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 60%)', filter: 'blur(80px)' }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#fbbf24] text-sm mb-6 transition-colors">
            <ArrowLeft size={16} />
            Înapoi acasă
          </Link>
          <h1 className="font-cinzel font-bold text-3xl text-white mb-2 tracking-wide">Rezervare masă</h1>
          <p className="text-white/50 mb-8">Completează formularul pentru a rezerva o masă la Baracca</p>
        </motion.div>

        {submitError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h2 className="font-cinzel font-semibold text-lg text-[#fbbf24] mb-5 flex items-center gap-2">
              <Phone size={18} className="text-[#f59e0b]" />
              Date de contact
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Nume complet *</label>
                <input
                  required name="customerName" value={formData.customerName}
                  onChange={handleChange} placeholder="Ion Popescu"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Telefon *</label>
                <input
                  required name="customerPhone" type="tel" value={formData.customerPhone}
                  onChange={handleChange} placeholder="07xx xxx xxx"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email (opțional)</label>
                <input
                  name="customerEmail" type="email" value={formData.customerEmail}
                  onChange={handleChange} placeholder="ion@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* Reservation Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h2 className="font-cinzel font-semibold text-lg text-[#fbbf24] mb-5 flex items-center gap-2">
              <Calendar size={18} className="text-[#f59e0b]" />
              Detalii rezervare
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Data *</label>
                <input
                  required name="reservationDate" type="date" value={formData.reservationDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Ora *</label>
                <select
                  required name="reservationTime" value={formData.reservationTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all text-sm"
                >
                  <option value="" className="bg-[#0a0a0e]">Selectează ora</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot} className="bg-[#0a0a0e]">{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Număr persoane *</label>
                <select
                  required name="numberOfGuests" value={formData.numberOfGuests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all text-sm"
                >
                  {GUEST_OPTIONS.map((n) => (
                    <option key={n} value={n} className="bg-[#0a0a0e]">{n} {n === 1 ? 'persoană' : 'persoane'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Preferință masă</label>
                <select
                  name="tablePreference" value={formData.tablePreference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all text-sm"
                >
                  {TABLE_PREFERENCES.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0a0a0e]">{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1.5">Ocazie</label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, occasion: occ.value }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.occasion === occ.value
                          ? 'bg-[#f59e0b]/20 border border-[#f59e0b] text-[#fbbf24]'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1.5">Observații / Cerințe speciale</label>
                <textarea
                  name="specialRequests" value={formData.specialRequests}
                  onChange={handleChange} rows={3}
                  placeholder="Alergeni, scaun copil, aniversare, etc."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] font-semibold rounded-xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.4)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Se trimite...</>
            ) : (
              <><Sparkles size={18} /> Trimite rezervarea</>
            )}
          </motion.button>

          <p className="text-center text-white/30 text-xs">
            Rezervarea va fi confirmată telefonic în maximum 2 ore. Baracca: +40 755 916 792
          </p>
        </form>
      </div>
    </div>
  );
}
