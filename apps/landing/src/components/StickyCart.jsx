import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';

const HIDDEN_PATHS = ['/checkout', '/login', '/inregistrare', '/cont', '/comanda-confirmata'];

export default function StickyCart() {
  const { items, totalItems, totalPrice, setIsOpen } = useCart();
  const location = useLocation();

  // Hide on checkout, login, register, account pages
  if (items.length === 0) return null;
  if (HIDDEN_PATHS.some((path) => location.pathname.startsWith(path))) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 bg-dark text-white pl-4 pr-2 py-3 rounded-2xl shadow-2xl shadow-dark/30 hover:shadow-dark/40 transition-shadow"
        >
          <div className="relative">
            <ShoppingCart size={20} />
            <motion.span
              key={totalItems}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          </div>

          <div className="text-left">
            <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Coșul tău</p>
            <p className="text-sm font-bold">{Math.round(totalPrice)} lei</p>
          </div>

          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center ml-1">
            <ChevronRight size={16} className="text-white/80" />
          </div>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
