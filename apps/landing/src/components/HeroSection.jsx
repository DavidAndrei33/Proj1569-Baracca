import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, UtensilsCrossed, Clock, Star, Calendar, Wine } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Cinematic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 60%)',
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute bottom-10 right-[5%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 60%)',
            filter: 'blur(50px)'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 60%)',
            filter: 'blur(80px)'
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-36">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8"
            >
              <Star size={14} className="text-[#fbbf24]" />
              <span className="text-[#fbbf24] text-xs font-medium tracking-widest uppercase">4.8★ Premium Italian</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-cinzel font-semibold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-8 tracking-wide"
            >
              <span className="block">LA TRATTORIA</span>
              <span className="block gradient-honey-text">PETRA'S</span>
              <span className="block text-white/80 text-2xl sm:text-3xl mt-4">una fetta d'Italia</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-white/50 text-base sm:text-lg max-w-lg mb-10 leading-relaxed"
            >
              Experimentează autenticul gust italian în inima Moineștiului. 
              Paste artizanale, pizza napoletană și preparate premium din carne, 
              într-o atmosferă caldă și primitoare.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link
                to="/rezervare"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] font-semibold rounded-xl shadow-[0_10px_40px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_50px_rgba(245,158,11,0.4)] transition-all duration-300"
              >
                <Calendar size={18} />
                Rezervă o masă
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/meniu"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10"
              >
                <UtensilsCrossed size={18} />
                Vezi meniul
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-wrap gap-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
                  <Star size={20} className="text-[#fbbf24]" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">4.8★</p>
                  <p className="text-white/40 text-xs tracking-wider uppercase">Rating Google</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
                  <Clock size={20} className="text-[#fbbf24]" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">12:00-21:30</p>
                  <p className="text-white/40 text-xs tracking-wider uppercase">Program</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
                  <Wine size={20} className="text-[#fbbf24]" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Premium</p>
                  <p className="text-white/40 text-xs tracking-wider uppercase">Vinotecă</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div 
                className="absolute -inset-8 rounded-[3rem] opacity-50"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(249,115,22,0.1) 50%, rgba(234,179,8,0.15) 100%)',
                  filter: 'blur(40px)'
                }}
              />
              
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=700&fit=crop"
                alt="Restaurant italian elegant"
                className="relative rounded-[2rem] shadow-2xl w-full max-w-lg mx-auto border border-white/10"
                loading="eager"
                decoding="async"
              />

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -right-6 top-12 glass-cinematic rounded-2xl p-4 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center">
                    <UtensilsCrossed size={24} className="text-[#fbbf24]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Bucătărie autentică</p>
                    <p className="text-white/50 text-xs">Ingrediente din Italia</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute -left-6 bottom-24 glass-cinematic rounded-2xl p-4 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center">
                    <Calendar size={24} className="text-[#fbbf24]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Rezervări online</p>
                    <p className="text-white/50 text-xs">Confirmare instant</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
