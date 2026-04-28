import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import client from '../api/client';

export default function MenuPreview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(8);

  useEffect(() => {
    client.get('/settings/landingProductLimit')
      .then((settingsRes) => {
        const productLimit = Number(settingsRes.data) || 8;
        setLimit(productLimit);
        return client.get(`/products?limit=${productLimit}`);
      })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        const sorted = list.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
        setProducts(sorted.slice(0, 4));
      })
      .catch(() => {
        client.get('/products?limit=8')
          .then((res) => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
            const sorted = list.sort((a, b) => {
              if (a.isFeatured && !b.isFeatured) return -1;
              if (!a.isFeatured && b.isFeatured) return 1;
              return 0;
            });
            setProducts(sorted.slice(0, 4));
          });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-[#0a0a0e] relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 60%)',
          filter: 'blur(80px)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Flame size={16} className="text-[#fbbf24]" />
              <span className="text-[#fbbf24] font-semibold text-sm tracking-wider uppercase">Descoperă</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-cinzel font-bold text-3xl sm:text-4xl text-white tracking-wide"
            >
              Cele mai <span className="gradient-honey-text">populare</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/50 mt-2 max-w-md"
            >
              Acestea sunt preparatele preferate ale clienților noștri. Încearcă-le și tu!
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/meniu"
              className="group inline-flex items-center gap-2 text-[#fbbf24] font-semibold hover:text-white transition-colors"
            >
              Vezi tot meniul
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#f59e0b] animate-spin" />
          </div>
        )}

        {/* Products grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
