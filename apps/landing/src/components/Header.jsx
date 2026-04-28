import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Utensils, MapPin, Phone, LogIn, User, UserPlus, Calendar } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.auth-menu-container')) {
        setAuthMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navLinks = [
    { path: '/', label: 'Acasă' },
    { path: '/meniu', label: 'Meniu' },
    { path: '/rezervare', label: 'Rezervare' },
    { path: '/cos', label: 'Coș' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#0a0a0e] border-b border-white/[0.06] text-white/70 text-xs py-2.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-white/60">
              <MapPin size={13} className="text-[#f59e0b]" />
              Strada Plopilor 2c, Moinești
            </span>
            <span className="flex items-center gap-2 text-white/60">
              <Phone size={13} className="text-[#f59e0b]" />
              <a href="tel:+40749107787" className="hover:text-[#fbbf24] transition-colors">+40 755 916 792</a>
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
            <span>Rezervări online · Experiență italiană autentică</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <motion.header
        className={`fixed top-0 md:top-[42px] left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'header-glass py-2'
            : 'bg-transparent py-4'
        } md:top-[42px] top-0`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full border-2 border-[#f59e0b]/30 flex items-center justify-center bg-[#f59e0b]/10 shadow-[0_0_30px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.3)] transition-all duration-500">
                <Utensils size={20} className="text-[#fbbf24]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-cinzel font-semibold text-base tracking-wider text-white">
                  PIZZERIA <span className="text-[#fbbf24]">BARACCA</span>
                </h1>
                <p className="text-[10px] text-white/40 font-medium tracking-[0.3em] uppercase">autentica napoletana</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-[#fbbf24] bg-[#f59e0b]/10 border border-[#f59e0b]/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Reservation button */}
              <Link
                to="/rezervare"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] text-sm font-semibold hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
              >
                <Calendar size={16} />
                Rezervă
              </Link>

              {/* Auth icon button */}
              <div className="auth-menu-container relative">
                <motion.button
                  onClick={() => setAuthMenuOpen(!authMenuOpen)}
                  className={`relative p-2.5 rounded-xl transition-all duration-300 border ${
                    isLoggedIn
                      ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#fbbf24] hover:bg-[#f59e0b]/20'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={isLoggedIn ? user?.name : 'Cont'}
                >
                  {isLoggedIn ? <User size={20} /> : <LogIn size={20} />}
                </motion.button>

                <AnimatePresence>
                  {authMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-cinematic rounded-xl shadow-2xl py-2 z-50"
                    >
                      {isLoggedIn ? (
                        <>
                          <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-white/50 truncate">{user?.email}</p>
                          </div>
                          <Link
                            to="/cont"
                            onClick={() => setAuthMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-[#fbbf24] hover:bg-[#f59e0b]/10 transition-colors"
                          >
                            <User size={16} />
                            Contul meu
                          </Link>
                          <button
                            onClick={() => { logout(); setAuthMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                          >
                            <LogIn size={16} />
                            Ieșire
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            onClick={() => setAuthMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-[#fbbf24] hover:bg-[#f59e0b]/10 transition-colors"
                          >
                            <LogIn size={16} />
                            Intră în cont
                          </Link>
                          <Link
                            to="/inregistrare"
                            onClick={() => setAuthMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-[#fbbf24] hover:bg-[#f59e0b]/10 transition-colors"
                          >
                            <UserPlus size={16} />
                            Creează cont
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart button */}
              <motion.button
                onClick={() => {
                  if (location.pathname !== '/meniu') {
                    navigate('/meniu');
                  }
                  setIsOpen(true);
                }}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart size={20} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#f59e0b] text-[#020204] text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden glass-cinematic shadow-2xl"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3.5 rounded-lg text-sm font-medium tracking-wide transition-all ${
                    isActive(link.path)
                      ? 'text-[#fbbf24] bg-[#f59e0b]/10 border border-[#f59e0b]/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 mt-3 pt-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/cont"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-[#fbbf24]"
                    >
                      <User size={18} />
                      Contul meu
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-red-400 text-left"
                    >
                      <LogIn size={18} />
                      Ieșire
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-white/70"
                    >
                      <LogIn size={18} />
                      Intră în cont
                    </Link>
                    <Link
                      to="/inregistrare"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-[#fbbf24]"
                    >
                      <UserPlus size={18} />
                      Creează cont
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
