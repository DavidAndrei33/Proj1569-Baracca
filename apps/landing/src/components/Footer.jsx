import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0e] text-white border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] flex items-center justify-center shadow-[0_8px_30px_rgba(245,158,11,0.3)]">
                <Flame size={24} className="text-[#020204]" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-xl text-white">Rotiserie & Pizza</h3>
                <p className="text-white/50 text-sm">Moinești</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Pizza artizanală la cuptor cu lemne, pui rotisat proaspăt și garnituri delicioase. 
              Comandă online și bucură-te de cele mai bune preparate din Moinești!
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#f59e0b]/20 flex items-center justify-center transition-colors border border-white/10">
                <Instagram size={18} className="text-[#fbbf24]" />
              </a>
              <a href="https://www.facebook.com/RotiseriePizzaM" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#f59e0b]/20 flex items-center justify-center transition-colors border border-white/10">
                <Facebook size={18} className="text-[#fbbf24]" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cinzel font-semibold text-lg mb-6 text-white">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-white/60 text-sm">
                <MapPin size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <span>Bloc 10, Strada Tudor Vladimirescu 10, 605400 Moinesti, Jud. Bacau</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Phone size={18} className="text-[#f59e0b] shrink-0" />
                <a href="tel:+40754292740" className="hover:text-[#fbbf24] transition-colors">+40 754 292 740</a>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Clock size={18} className="text-[#f59e0b] shrink-0" />
                <span>Luni - Duminică: 06:30 - 23:00 | Livrări: 10:00 - 24:00</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-cinzel font-semibold text-lg mb-6 text-white">Linkuri rapide</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-white/60 hover:text-[#fbbf24] text-sm transition-colors">Acasă</Link>
              <Link to="/meniu" className="block text-white/60 hover:text-[#fbbf24] text-sm transition-colors">Meniu complet</Link>
              <Link to="/cos" className="block text-white/60 hover:text-[#fbbf24] text-sm transition-colors">Coș de cumpărături</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            © 2026 Rotiserie & Pizza Moinești. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <span>Cu</span>
            <Flame size={12} className="text-[#f59e0b]" />
            <span>pentru mâncare adevărată</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
