import React, { useState, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Timer, Flame, Check, ImageOff } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%2312121a"/%3E%3Ctext x="200" y="150" font-family="Inter" font-size="16" fill="%23666" text-anchor="middle" dominant-baseline="middle"%3EFără imagine%3C/text%3E%3C/svg%3E';

// Memoized ProductCard with cinematic styling
const ProductCard = memo(function ProductCard({ product, index }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setQuantity(1);
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Popular': return 'bg-[#f59e0b]/90';
      case 'Recomandat': return 'bg-[#10b981]/90';
      case 'Picant': return 'bg-[#ef4444]/90';
      case 'Fresh': return 'bg-[#06b6d4]/90';
      case 'Top': return 'bg-[#8b5cf6]/90';
      default: return 'bg-white/20';
    }
  };

  const imageUrl = product.image && !imgError ? product.image : PLACEHOLDER_IMG;

  // Calculate animation delay based on index
  const animationDelay = `${index * 0.08}s`;

  return (
    <div 
      className="group product-card-cinematic stagger-item"
      style={{ '--delay': animationDelay }}
    >
      <div className="card-cinematic rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-[#0a0a0e]">
          {imageUrl === PLACEHOLDER_IMG ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff size={32} className="text-white/20" />
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-transparent to-transparent" />
          
          {product.badge && (
            <span className={`absolute top-3 left-3 ${getBadgeColor(product.badge)} text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm`}>
              {product.badge}
            </span>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/80 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10">
              <Timer size={10} className="text-[#fbbf24]" />
              {product.prepTime}
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/80 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10">
              <Flame size={10} className="text-[#fbbf24]" />
              {product.calories}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-cinzel font-semibold text-lg text-white mb-2 group-hover:text-[#fbbf24] transition-colors tracking-wide">
            {product.name}
          </h3>
          <p className="text-white/40 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="font-cinzel font-bold text-2xl text-[#fbbf24]">{product.price}</span>
              <span className="text-white/40 text-sm ml-1">lei</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quantity selector */}
              <div className="flex items-center bg-white/5 rounded-lg overflow-hidden border border-white/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Scade cantitate"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[28px] min-h-[36px] w-7 h-9 flex items-center justify-center text-sm font-semibold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Adaugă cantitate"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to cart button */}
              <motion.button
                onClick={handleAdd}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className={`min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 relative overflow-hidden ${
                  added
                    ? 'bg-green-500 shadow-green-500/30'
                    : 'bg-gradient-to-r from-[#f59e0b] to-[#f97316] shadow-[0_8px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.4)]'
                }`}
                aria-label="Adaugă în coș"
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <Check size={18} className="text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cart"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <ShoppingCart size={16} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.image === nextProps.product.image &&
    prevProps.index === nextProps.index
  );
});

export default ProductCard;
