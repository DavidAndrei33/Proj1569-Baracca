import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Store, Phone, MapPin, Mail, Save, Bell, Shield,
  CreditCard, Truck, Check, CalendarDays, ToggleLeft, ToggleRight,
  Loader2, Lock, User, UserPlus,
} from 'lucide-react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext.jsx';

const DAYS = [
  { key: 'monday', label: 'Luni', dayOfWeek: 1 },
  { key: 'tuesday', label: 'Marți', dayOfWeek: 2 },
  { key: 'wednesday', label: 'Miercuri', dayOfWeek: 3 },
  { key: 'thursday', label: 'Joi', dayOfWeek: 4 },
  { key: 'friday', label: 'Vineri', dayOfWeek: 5 },
  { key: 'saturday', label: 'Sâmbătă', dayOfWeek: 6 },
  { key: 'sunday', label: 'Duminică', dayOfWeek: 0 },
];

const defaultSchedule = {
  monday: { open: true, from: '10:00', to: '22:00' },
  tuesday: { open: true, from: '10:00', to: '22:00' },
  wednesday: { open: true, from: '10:00', to: '22:00' },
  thursday: { open: true, from: '10:00', to: '22:00' },
  friday: { open: true, from: '10:00', to: '23:00' },
  saturday: { open: true, from: '10:00', to: '23:00' },
  sunday: { open: true, from: '10:00', to: '22:00' },
};

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [savedSections, setSavedSections] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settings, setSettings] = useState({
    restaurantName: 'Pizzeria Baracca',
    address: 'Strada Plopilor 2c, Moinești, Bacău',
    phone: '+40 755 916 792',
    email: 'contact@baracca.ro',
    deliveryEnabled: true,
    deliveryFee: 10,
    minOrder: 30,
    notifications: true,
    autoAccept: false,
  });

  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    pin: '1234',
  });
  const [adminLoading, setAdminLoading] = useState(false);

  const [landingProductLimit, setLandingProductLimit] = useState(8);
  const [menuProductLimit, setMenuProductLimit] = useState(50);
  const [schedule, setSchedule] = useState(() => {
    const stored = localStorage.getItem('rotiserie_schedule');
    return stored ? JSON.parse(stored) : defaultSchedule;
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const res = await client.get('/settings');
        const data = res.data;
        if (data) {
          setSettings((prev) => ({
            ...prev,
            restaurantName: data.restaurantName || prev.restaurantName,
            address: data.address || prev.address,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            deliveryEnabled: data.deliveryEnabled ?? prev.deliveryEnabled,
            deliveryFee: data.deliveryFee ?? prev.deliveryFee,
            minOrder: data.minOrder ?? prev.minOrder,
            notifications: data.notifications ?? prev.notifications,
            autoAccept: data.autoAccept ?? prev.autoAccept,
          }));
          if (data.landingProductLimit) setLandingProductLimit(Number(data.landingProductLimit));
          if (data.menuProductLimit) setMenuProductLimit(Number(data.menuProductLimit));
        }
        const meRes = await client.get('/auth/me');
        if (meRes.data) {
          setProfile({
            name: meRes.data.name || '',
            email: meRes.data.email || '',
            phone: meRes.data.phone || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSection = async (section) => {
    try {
      if (section === 'schedule') {
        await Promise.all(
          DAYS.map((day) =>
            client.put(`/settings/business-hours/${day.dayOfWeek}`, {
              openTime: schedule[day.key].from,
              closeTime: schedule[day.key].to,
              isClosed: !schedule[day.key].open,
            })
          )
        );
        localStorage.setItem('rotiserie_schedule', JSON.stringify(schedule));
      } else if (section === 'general') {
        await client.put('/settings/deliveryEnabled', { value: String(settings.deliveryEnabled) });
        await client.put('/settings/notifications', { value: String(settings.notifications) });
        await client.put('/settings/autoAccept', { value: String(settings.autoAccept) });
      } else if (section === 'info') {
        await client.put('/settings/restaurantName', { value: settings.restaurantName });
        await client.put('/settings/address', { value: settings.address });
        await client.put('/settings/phone', { value: settings.phone });
        await client.put('/settings/email', { value: settings.email });
      } else if (section === 'delivery') {
        await client.put('/settings/deliveryFee', { value: String(settings.deliveryFee) });
        await client.put('/settings/minOrder', { value: String(settings.minOrder) });
        await client.put('/settings/landingProductLimit', { value: String(landingProductLimit) });
        await client.put('/settings/menuProductLimit', { value: String(menuProductLimit) });
      }
      setSavedSections((prev) => ({ ...prev, [section]: true }));
      setTimeout(() => setSavedSections((prev) => ({ ...prev, [section]: false })), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert(err.response?.data?.message || 'Eroare la salvare');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      await client.put('/auth/profile', profile);
      setSavedSections((prev) => ({ ...prev, profile: true }));
      setTimeout(() => setSavedSections((prev) => ({ ...prev, profile: false })), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Eroare la salvarea profilului');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Parolele nu coincid!');
      return;
    }
    try {
      setPasswordLoading(true);
      await client.put('/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSavedSections((prev) => ({ ...prev, password: true }));
      setTimeout(() => setSavedSections((prev) => ({ ...prev, password: false })), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la schimbarea parolei');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      alert('Completează toate câmpurile obligatorii!');
      return;
    }
    try {
      setAdminLoading(true);
      await client.post('/auth/create-admin', adminForm);
      setAdminForm({ name: '', email: '', password: '', phone: '', pin: '1234' });
      setSavedSections((prev) => ({ ...prev, admin: true }));
      setTimeout(() => setSavedSections((prev) => ({ ...prev, admin: false })), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la crearea adminului');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleChange = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }));
  const handleScheduleChange = (day, field, value) => setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  const toggleDay = (day) => setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], open: !prev[day].open } }));

  const SaveButton = ({ section, loading, onClick }) => (
    <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
      <button onClick={onClick || (() => handleSaveSection(section))} disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSections[section] ? <><Check className="w-4 h-4" />Salvat!</> : <><Save className="w-4 h-4" />Salvează</>}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-bold text-text-primary">Setări</h1><p className="text-text-muted mt-1">Configurează preferințele restaurantului</p></div>
      {settingsLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /><span className="ml-3 text-text-muted">Se încarcă...</span></div>}
      {!settingsLoading && (
        <>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary" />Profilul Meu</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Nume</label><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Telefon</label><input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" /></div>
            </div>
            <SaveButton section="profile" loading={profileLoading} onClick={handleSaveProfile} />
          </motion.div>

          {user?.role === 'ADMIN' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Creează Admin</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Nume *</label><input type="text" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Email *</label><input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Parolă *</label><input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Telefon</label><input type="tel" value={adminForm.phone} onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-text-secondary mb-1.5">PIN</label><input type="text" value={adminForm.pin} onChange={(e) => setAdminForm({ ...adminForm, pin: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="input-field" maxLength={10} /></div>
              </div>
              <SaveButton section="admin" loading={adminLoading} onClick={handleCreateAdmin} />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-primary" />Preferințe</h3>
            <div className="space-y-4">
              {['deliveryEnabled', 'notifications', 'autoAccept'].map((key) => (
                <div key={key} className="flex items-center justify-between py-2 border-t border-gray-100 first:border-0 first:pt-0">
                  <div><p className="text-sm font-medium text-text-primary">{key === 'deliveryEnabled' ? 'Livrare' : key === 'notifications' ? 'Notificări' : 'Auto Accept'}</p></div>
                  <button onClick={() => handleChange(key, !settings[key])} className={`w-12 h-6 rounded-full transition-colors relative ${settings[key] ? 'bg-primary' : 'bg-gray-200'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-0.5'}`} /></button>
                </div>
              ))}
            </div>
            <SaveButton section="general" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" />Program</h3>
            <div className="space-y-2">
              {DAYS.map((day) => (
                <div key={day.key} className="flex items-center gap-4 py-2">
                  <span className="w-24 text-sm">{day.label}</span>
                  <button onClick={() => toggleDay(day.key)} className="text-sm">{schedule[day.key].open ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}</button>
                  <input type="time" value={schedule[day.key].from} onChange={(e) => handleScheduleChange(day.key, 'from', e.target.value)} disabled={!schedule[day.key].open} className="input-field w-24 text-sm" />
                  <input type="time" value={schedule[day.key].to} onChange={(e) => handleScheduleChange(day.key, 'to', e.target.value)} disabled={!schedule[day.key].open} className="input-field w-24 text-sm" />
                </div>
              ))}
            </div>
            <SaveButton section="schedule" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-6">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><Store className="w-5 h-5 text-primary" />Informații</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Nume</label><input type="text" value={settings.restaurantName} onChange={(e) => handleChange('restaurantName', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Adresă</label><input type="text" value={settings.address} onChange={(e) => handleChange('address', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Telefon</label><input type="text" value={settings.phone} onChange={(e) => handleChange('phone', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label><input type="email" value={settings.email} onChange={(e) => handleChange('email', e.target.value)} className="input-field" /></div>
            </div>
            <SaveButton section="info" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" />Livrare și Limite</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Taxă Livrare (lei)</label><input type="number" value={settings.deliveryFee} onChange={(e) => handleChange('deliveryFee', Number(e.target.value))} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Comandă Minimă (lei)</label><input type="number" value={settings.minOrder} onChange={(e) => handleChange('minOrder', Number(e.target.value))} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Limită Landing</label><input type="number" value={landingProductLimit} onChange={(e) => setLandingProductLimit(Number(e.target.value))} className="input-field" /><p className="text-xs text-text-muted mt-1">Produse pe homepage</p></div>
              <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Limită Meniu</label><input type="number" value={menuProductLimit} onChange={(e) => setMenuProductLimit(Number(e.target.value))} className="input-field" /><p className="text-xs text-text-muted mt-1">Produse pe pagina meniu</p></div>
            </div>
            <SaveButton section="delivery" />
          </motion.div>
        </>
      )}
    </div>
  );
}
