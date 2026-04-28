import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Cinematic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />

          {/* Drawer - Cinematic */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0e] z-[70] shadow-2xl flex flex-col border-l border-white/10"
          >
            {/* Header - Cinematic */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <ShoppingBag size={18} className="text-[#020204]" />
                </div>
                <div>
                  <h2 className="font-cinzel font-semibold text-lg text-white tracking-wide">Coșul tău</h2>
                  <p className="text-white/50 text-xs">{totalItems} {totalItems === 1 ? 'produs' : 'produse'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="min-w-[44px] min-h-[44px] w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Închide coșul"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-white/20" />
                  </div>
                  <h3 className="font-cinzel font-semibold text-lg text-white/60 mb-2">Coșul este gol</h3>
                  <p className="text-white/40 text-sm mb-6">Adaugă produse delicioase din meniul nostru!</p>
                  <Link
                    to="/meniu"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] text-sm font-semibold rounded-xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.4)] transition-shadow"
                  >
                    Vezi meniul
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="w-20 h-20 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-white truncate">{item.name}</h4>
                          <p className="text-[#fbbf24] font-semibold text-sm mt-1">{item.price} lei</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-white/5 rounded-lg overflow-hidden border border-white/10">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Scade cantitate"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-[36px] h-11 flex items-center justify-center text-sm font-semibold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Adaugă cantitate"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                              aria-label="Șterge produs"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Cinematic */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="font-semibold text-white">{totalPrice.toFixed(2)} lei</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Livrare</span>
                  <span className="text-green-400 font-medium">Gratuită</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-white/80 font-medium">Total</span>
                  <span className="font-cinzel font-bold text-2xl text-[#fbbf24]">{totalPrice.toFixed(2)} lei</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] font-semibold rounded-xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  Continuă către plată
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-3 text-white/50 hover:text-red-400 text-sm transition-colors"
                >
                  Golește coșul
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
