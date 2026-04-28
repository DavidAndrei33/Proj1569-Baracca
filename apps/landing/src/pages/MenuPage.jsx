import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { useDebounce } from '../hooks/useDebounce';
import client from '../api/client';

const localCategories = [
  { id: 'all', name: 'Toate', icon: 'UtensilsCrossed' },
  { id: 'pizza', name: 'Pizza', icon: 'Pizza' },
  { id: 'pui-rotisat', name: 'Pui Rotisat', icon: 'Drumstick' },
  { id: 'garnituri', name: 'Garnituri', icon: 'Leaf' },
  { id: 'bauturi', name: 'Băuturi', icon: 'CupSoda' },
  { id: 'desert', name: 'Desert', icon: 'Cake' },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(localCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const settingsRes = await client.get('/settings/menuProductLimit').catch(() => ({ data: '50' }));
        const productLimit = Number(settingsRes.data) || 50;
        
        const [productsRes, categoriesRes] = await Promise.all([
          client.get(`/products?limit=${productLimit}`),
          client.get('/categories'),
        ]);
        const productList = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.products || []);
        const categoryList = Array.isArray(productsRes.data?.categories) ? productsRes.data.categories : (Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setProducts(productList);
        if (categoryList.length > 0) {
          setCategories([
            { id: 'all', name: 'Toate', icon: 'UtensilsCrossed' },
            ...categoryList.map((c) => ({ id: c.slug || c.id, name: c.name, icon: c.icon || 'UtensilsCrossed' })),
          ]);
        }
      } catch (err) {
        setError('Nu am putut încărca produsele. Încearcă din nou.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category?.slug === activeCategory || p.categorySlug === activeCategory || p.categoryId === activeCategory);
    }

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name?.localeCompare(b.name));
    }

    return result;
  }, [activeCategory, debouncedSearch, sortBy, products]);

  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-32 pb-20 relative">
      {/* Cinematic background glow */}
      <div className="absolute top-0 left-0 w-full h-96 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 60%)',
            filter: 'blur(60px)'
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page header - Cinematic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-cinzel font-semibold text-3xl sm:text-4xl lg:text-5xl text-white mb-3 tracking-wide">
            MENIUL <span className="text-[#fbbf24]">NOSTRU</span>
          </h1>
          <p className="text-white/50 text-lg">Descoperă preparatele noastre delicioase și comandă acum</p>
        </motion.div>

        {/* Search and filters - Cinematic */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Caută preparate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/10 outline-none transition-all text-sm text-white placeholder:text-white/30"
            />
          </div>
          <div className="relative shrink-0">
            <SlidersHorizontal size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-11 pr-10 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#f59e0b]/50 focus:ring-2 focus:ring-[#f59e0b]/10 outline-none transition-all text-sm text-white appearance-none cursor-pointer"
            >
              <option value="default" className="bg-[#12121a]">Sortare implicită</option>
              <option value="price-asc" className="bg-[#12121a]">Preț: crescător</option>
              <option value="price-desc" className="bg-[#12121a]">Preț: descrescător</option>
              <option value="name" className="bg-[#12121a]">Nume: A-Z</option>
            </select>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-12">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {/* Loading state - Cinematic */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" />
            <span className="ml-3 text-white/50">Se încarcă produsele...</span>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#fbbf24] font-medium hover:underline"
            >
              Reîncearcă
            </button>
          </div>
        )}

        {/* Products grid */}
        {!loading && !error && filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        ) : !loading && !error && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">Nu am găsit produse care să corespundă căutării tale.</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 text-[#fbbf24] font-medium hover:underline"
            >
              Resetează filtrele
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
