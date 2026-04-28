import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Utensils,
  X,
  Users,
  Calendar,
  Armchair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/meniu', icon: UtensilsCrossed, label: 'Meniu' },
  { path: '/comenzi', icon: ClipboardList, label: 'Comenzi' },
  { path: '/rezervari', icon: Calendar, label: 'Rezervări' },
  { path: '/mese', icon: Armchair, label: 'Mese' },
  { path: '/rapoarte', icon: BarChart3, label: 'Rapoarte' },
  { path: '/utilizatori', icon: Users, label: 'Utilizatori' },
  { path: '/setari', icon: Settings, label: 'Setări' },
];

export default function Sidebar({ open, setOpen, isMobile }) {
  const location = useLocation();

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-gray-200 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-text-primary text-sm leading-tight">
                  Pizzeria Baracca
                </h1>
                <p className="text-xs text-text-muted">Moinești</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto p-2 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="px-4 py-4 border-t border-gray-100">
              <p className="text-xs text-text-muted text-center">v2.0.0 · Baracca</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 256 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col hidden lg:flex"
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
          <Utensils className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h1 className="font-bold text-text-primary text-sm leading-tight whitespace-nowrap">
                Pizzeria Baracca
              </h1>
              <p className="text-xs text-text-muted whitespace-nowrap">Moinești</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
        >
          {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={!open ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <AnimatePresence>
          {open && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-text-muted text-center"
            >
              v2.0.0 · Baracca
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
