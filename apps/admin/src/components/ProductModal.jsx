import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';

export default function ProductModal({ isOpen, onClose, onSave, product, categories, onCategoryCreated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    isAvailable: true,
    image: '',
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || (product.category?.id) || '',
        price: product.price || '',
        isAvailable: product.isAvailable !== false,
        image: product.image || '',
      });
      setImagePreview(product.image || null);
    } else {
      setForm({
        name: '',
        description: '',
        categoryId: categories[0]?.id || '',
        price: '',
        isAvailable: true,
        image: '',
      });
      setImagePreview(null);
    }
    setIsCreatingCategory(false);
    setNewCategoryName('');
  }, [product, isOpen, categories]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await client.post('/upload', formData);

      if (res.data?.url) {
        setForm((prev) => ({ ...prev, image: res.data.url }));
        setImagePreview(res.data.url);
      }
    } catch (err) {
      alert('Eroare la încărcarea imaginii: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    // Delete the old image file from server if it exists
    if (form.image && form.image.startsWith('/uploads/')) {
      try {
        const filename = form.image.split('/').pop();
        await client.delete(`/upload/${filename}`);
      } catch (err) {
        // Ignore errors - file might not exist or user might not have permission
        console.log('Could not delete old image file:', err);
      }
    }
    
    setForm((prev) => ({ ...prev, image: '' }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setLoading(true);
      const slug = newCategoryName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const res = await client.post('/categories', {
        name: newCategoryName.trim(),
        slug,
        description: '',
      });
      setForm({ ...form, categoryId: res.data.id });
      setIsCreatingCategory(false);
      setNewCategoryName('');
      onCategoryCreated?.();
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la crearea categoriei');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      alert('Selectează o categorie');
      return;
    }
    onSave({ 
      ...form, 
      price: Number(form.price), 
      id: product?.id || Date.now(),
      categoryId: Number(form.categoryId),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-text-primary">
                {product ? 'Editează Produs' : 'Adaugă Produs'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Imagine Produs</label>
                <div
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed border-gray-300 rounded-xl p-4 transition-colors ${
                    imagePreview ? '' : 'cursor-pointer hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        title="Șterge imaginea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div 
                        className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <span className="text-white text-sm font-medium">Schimbă imaginea</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <ImageIcon className="w-8 h-8 text-text-muted" />
                      <span className="text-sm text-text-muted">Click pentru a încărca o imagine</span>
                      <span className="text-xs text-text-muted">JPG, PNG, WebP (max 5MB)</span>
                    </div>
                  )}
                  
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <span className="ml-2 text-sm text-text-secondary">Se încarcă...</span>
                    </div>
                  )}
                </div>
                
                {/* Manual URL input + remove link */}
                <div className="mt-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => {
                        setForm({ ...form, image: e.target.value });
                        setImagePreview(e.target.value || null);
                      }}
                      className="input-field pl-10 w-full"
                      placeholder="https://... sau lasă gol fără imagine"
                    />
                    <Upload className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  </div>
                  {form.image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Șterge imaginea și lasă fără poză
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Nume *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Pizza Margherita"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Descriere</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Descriere produs..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Categorie *</label>
                  {!isCreatingCategory ? (
                    <div className="space-y-2">
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        className="input-field w-full"
                        required
                      >
                        <option value="">Selectează...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(true)}
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                      >
                        <Plus className="w-4 h-4" />
                        Categorie nouă
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nume categorie nouă"
                        className="input-field"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={loading || !newCategoryName.trim()}
                          className="flex-1 px-3 py-1.5 bg-primary text-white text-sm rounded-lg disabled:opacity-50"
                        >
                          {loading ? 'Se creează...' : 'Creează'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingCategory(false);
                            setNewCategoryName('');
                          }}
                          className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg"
                        >
                          Anulează
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Preț (lei) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-secondary">Disponibil</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-text-secondary font-medium hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5"
                >
                  {product ? 'Salvează' : 'Adaugă'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
