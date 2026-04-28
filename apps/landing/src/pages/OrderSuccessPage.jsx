import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-28 pb-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-6 border border-[#10b981]/20"
        >
          <CheckCircle size={48} className="text-[#10b981]" />
        </motion.div>

        <h1 className="font-cinzel font-bold text-3xl text-white mb-3">
          Comanda a fost plasată!
        </h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          Îți mulțumim pentru comandă! Vei primi un SMS cu confirmarea și detaliile livrării în curând. 
          Timp estimat de livrare: <span className="text-[#fbbf24] font-medium">25-35 minute</span>.
        </p>

        <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06] mb-8">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Număr comandă</span>
              <span className="font-mono font-semibold text-white">#ORD-{Math.floor(Math.random() * 90000) + 10000}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Status</span>
              <span className="text-[#10b981] font-medium">Confirmată</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Estimare livrare</span>
              <span className="text-white font-medium">25-35 min</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/10"
          >
            <Home size={18} />
            Acasă
          </Link>
          <Link
            to="/meniu"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] font-semibold rounded-xl shadow-[0_10px_40px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_50px_rgba(245,158,11,0.4)] transition-shadow"
          >
            <ShoppingBag size={18} />
            Comandă din nou
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
