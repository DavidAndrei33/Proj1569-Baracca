import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Power, ImageOff, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import client from '../api/client';
import ProductModal from '../components/ProductModal.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'Toate', slug: 'all' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        client.get('/products?all=true'),
        client.get('/categories'),
      ]);
      const allProducts = productsRes.data?.products || productsRes.data || [];
      setProducts(allProducts);
      setTotalProducts(allProducts.length);
      
      const cats = categoriesRes.data || [];
      setCategories([
        { id: 'all', name: 'Toate', slug: 'all' },
        ...cats.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
      ]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === 'all' || p.category?.slug === activeCategory;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleAvailability = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    try {
      setActionLoading(true);
      await client.put(`/products/${id}`, { ...product, isAvailable: !product.isAvailable });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
      );
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Sigur vrei să ștergi acest produs?')) return;
    try {
      setActionLoading(true);
      await client.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (product) => {
    try {
      setActionLoading(true);
      const exists = products.find((p) => p.id === product.id);
      if (exists) {
        const res = await client.put(`/products/${product.id}`, product);
        setProducts((prev) => prev.map((p) => (p.id === product.id ? res.data : p)));
      } else {
        const res = await client.post('/products', product);
        setProducts((prev) => [...prev, res.data]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save product:', err);
      alert(err.response?.data?.message || 'Eroare la salvare');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Sigur vrei să ștergi categoria "${name}"? Produsele din această categorie vor rămâne fără categorie.`)) return;
    try {
      setActionLoading(true);
      await client.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setActiveCategory('all');
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la ștergerea categoriei');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Meniu</h1>
          <p className="text-text-muted mt-1">Gestionează produsele restaurantului ({products.length} produse)</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          Adaugă Produs
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Caută produse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 items-center">
        {categories.map((cat) => (
          <div key={cat.slug} className="flex items-center gap-1">
            <button
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-secondary border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
            {cat.slug !== 'all' && (
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                disabled={actionLoading}
                className="p-1.5 text-text-muted hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                title="Șterge categorie"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-text-muted">Se încarcă produsele...</span>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {paginatedProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="card overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  {product.image && !imageErrors[product.id] ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(product.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <ImageOff className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-text-secondary hover:text-primary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={actionLoading}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-text-secondary hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        product.isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.isAvailable ? 'Activ' : 'Inactiv'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">{product.name}</h3>
                      <p className="text-xs text-text-muted capitalize mt-0.5">{product.category?.name || 'Fără categorie'}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{product.price} lei</p>
                  </div>
                  <p className="text-sm text-text-muted mt-2 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-text-muted">
                      ID: #{String(product.id).padStart(3, '0')}
                    </span>
                    <button
                      onClick={() => handleToggleAvailability(product.id)}
                      disabled={actionLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        product.isAvailable
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {product.isAvailable ? 'Dezactivează' : 'Activează'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted">Niciun produs găsit</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 text-text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 text-text-secondary hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-sm text-text-muted ml-2">
            {filtered.length} produse
          </span>
        </div>
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
        categories={categories.filter(c => c.slug !== 'all')}
        onCategoryCreated={fetchData}
      />
    </div>
  );
}
