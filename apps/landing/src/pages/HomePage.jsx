import React from 'react';
import HeroSection from '../components/HeroSection';
import MenuPreview from '../components/MenuPreview';
import { motion } from 'framer-motion';
import { Calendar, UtensilsCrossed, Wine, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const features = [
    {
      icon: UtensilsCrossed,
      title: 'Bucătărie Italiană Autentică',
      description: 'Paste artizanale, pizza napoletană și preparate din carne premium, gătite după rețete tradiționale italiene.',
      color: 'text-[#fbbf24]',
      bg: 'bg-[#f59e0b]/10 border-[#f59e0b]/20',
    },
    {
      icon: Calendar,
      title: 'Rezervări Online',
      description: 'Rezervă-ți masa în avans pentru o experiență perfectă. Aniversări, cine romantice sau întâlniri de afaceri.',
      color: 'text-[#06b6d4]',
      bg: 'bg-[#06b6d4]/10 border-[#06b6d4]/20',
    },
    {
      icon: Wine,
      title: 'Vinotecă Selectă',
      description: 'Colecție de vinuri românești și italiene alese cu grijă, perfecte pentru a însoți fiecare preparat.',
      color: 'text-[#10b981]',
      bg: 'bg-[#10b981]/10 border-[#10b981]/20',
    },
    {
      icon: ChefHat,
      title: 'Chef cu Experiență',
      description: 'Echipa noastră de bucătari aduce autenticitatea Italiei în farfuriile tale, cu pasiune și măiestrie.',
      color: 'text-[#f97316]',
      bg: 'bg-[#f97316]/10 border-[#f97316]/20',
    },
  ];

  return (
    <div className="bg-[#0a0a0e]">
      <HeroSection />
      <MenuPreview />

      {/* About section */}
      <section className="py-20 bg-[#0a0a0e] relative">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 60%)',
            filter: 'blur(80px)'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-white mb-6 tracking-wide">
                O <span className="gradient-honey-text">felie din Italia</span> în inima Moineștiului
              </h2>
              <p className="text-white/60 mb-4 leading-relaxed">
                La Pizzeria Baracca aducem autenticul gust napoletan în orașul tău. Fiecare pizza este coaptă în cuptor cu lemne, 
                după rețete tradiționale transmise din generație în generație.
              </p>
              <p className="text-white/60 mb-6 leading-relaxed">
                Folosim ingrediente proaspete, importate direct din Italia – de la făina 00 la mozzarella di bufala 
                și uleiul de măsline extra virgin.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-[#fbbf24]">4.9★</p>
                  <p className="text-xs text-white/50">Rating Google</p>
                </div>
                <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-[#fbbf24]">816+</p>
                  <p className="text-xs text-white/50">Recenzii</p>
                </div>
                <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-[#fbbf24]">2020</p>
                  <p className="text-xs text-white/50">Deschis din</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#f59e0b]/20 to-[#f97316]/10 border border-white/10 flex items-center justify-center">
                <UtensilsCrossed size={80} className="text-[#fbbf24]/30" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#f97316] flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#020204]">SINCE</p>
                  <p className="text-3xl font-bold text-[#020204]">2020</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-[#0a0a0e] relative">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 60%)',
            filter: 'blur(80px)'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-white mb-4 tracking-wide">
              De ce să ne <span className="gradient-honey-text">alegi?</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Suntem dedicați să oferim cea mai bună experiență culinară italiană din Moinești
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 border`}>
                  <feature.icon size={28} className={feature.color} />
                </div>
                <h3 className="font-cinzel font-semibold text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-[#0a0a0e] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f97316]/10 rounded-full blur-[150px]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-cinzel font-bold text-3xl sm:text-5xl text-white mb-6 tracking-wide">
              Rezervă-ți masa și trăiește <span className="text-[#fbbf24]">experiența italiană</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
              Fie că ești în căutarea unei cine romantice, a unei întâlniri de afaceri sau pur și simplu 
              vrei să savurezi autenticul gust italian, te așteptăm cu brațele deschise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/rezervare"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#020204] font-semibold rounded-xl shadow-[0_10px_40px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_50px_rgba(245,158,11,0.4)] transition-all duration-300 text-lg"
              >
                <Calendar size={20} />
                Rezervă o masă
              </Link>
              <Link
                to="/meniu"
                className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#f59e0b] text-[#fbbf24] font-semibold rounded-xl hover:bg-[#f59e0b]/10 transition-all duration-300 text-lg"
              >
                <UtensilsCrossed size={20} />
                Vezi meniul
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
