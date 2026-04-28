import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, ArrowLeft, UserPlus, Loader2 } from 'lucide-react';

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError('⚠️ Completează toate câmpurile obligatorii');
      return;
    }
    
    if (form.name.trim().length < 2) {
      setError('⚠️ Numele trebuie să aibă minim 2 caractere');
      return;
    }
    
    if (form.email.trim().length < 5 || !form.email.includes('@')) {
      setError('⚠️ Adresa de email nu este validă');
      return;
    }
    
    if (form.phone.trim().length < 10) {
      setError('⚠️ Numărul de telefon trebuie să aibă minim 10 cifre');
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError('⚠️ Parolele nu coincid. Verifică și încearcă din nou.');
      return;
    }
    
    if (form.password.length < 8) {
      setError('⚠️ Parola trebuie să aibă minim 8 caractere');
      return;
    }
    
    setLoading(true);
    const result = await register(form.name, form.email, form.phone, form.password);
    setLoading(false);
    
    if (result.success) {
      navigate('/cont');
    } else {
      let msg = result.error;
      
      if (msg === 'Email already registered' || msg?.includes('already registered')) {
        msg = '📧 Acest email este deja înregistrat. Încearcă să te loghezi sau folosește alt email.';
      } else if (msg === 'Invalid email address' || msg?.includes('Invalid email')) {
        msg = '📧 Adresa de email nu este validă. Verifică formatul.';
      } else if (msg?.includes('Password must be at least') || msg?.includes('minim 8')) {
        msg = '🔒 Parola trebuie să aibă minim 8 caractere.';
      } else if (msg?.includes('Name must be at least') || msg?.includes('minim 2 caractere')) {
        msg = '👤 Numele trebuie să aibă minim 2 caractere.';
      } else if (msg === 'Validation failed' || msg?.includes('validation')) {
        msg = '⚠️ Datele introduse nu sunt valide. Verifică toate câmpurile.';
      } else if (msg?.includes('network') || msg?.includes('Network Error')) {
        msg = '🌐 Eroare de conexiune. Verifică internetul și încearcă din nou.';
      } else if (msg?.includes('server') || msg?.includes('500')) {
        msg = '🔧 Eroare server. Încearcă din nou peste câteva momente.';
      } else if (!msg || msg === 'Eroare la înregistrare') {
        msg = '❌ A apărut o eroare la înregistrare. Încearcă din nou.';
      }
      
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e] px-4 pt-20">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 60%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#fbbf24] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la meniu</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-cinzel font-bold text-[#fbbf24] mb-2 tracking-wide">Creează cont</h1>
            <p className="text-white/50">Comandă mai rapid și urmărește comenzile</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nume complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Andrei Popescu"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="exemplu@email.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="0722 123 456"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Parolă</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="Minim 8 caractere"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Confirmă parola</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] py-4 rounded-xl font-semibold hover:shadow-[0_8px_30px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Se procesează...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Creează cont
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              Ai deja cont?{' '}
              <Link to="/login" className="text-[#fbbf24] font-semibold hover:underline">
                Intră în cont
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
