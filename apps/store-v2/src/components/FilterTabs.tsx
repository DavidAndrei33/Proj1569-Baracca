import { motion } from 'framer-motion';
import { useKDSStore } from '../store';
import type { FilterTab } from '../types';

const filters: FilterTab[] = [
  { id: 'RECEIVED', label: 'Comenzi Noi' },
  { id: 'PREPARING', label: 'În prep' },
  { id: 'READY', label: 'Gata' },
  { id: 'PICKED_UP', label: 'Ridicate' },
  { id: 'CANCELLED', label: 'Anulate' },
];

export function FilterTabs() {
  const { activeFilter, setActiveFilter, orders } = useKDSStore();

  const getCount = (id: FilterTab['id']) => {
    if (id === 'all') return orders.length;
    return orders.filter((o) => o.status === id).length;
  };

  return (
    <div className="flex gap-2 px-4 md:px-6 py-2 md:py-3 bg-bg-primary overflow-x-auto scrollbar-hide">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        const count = getCount(filter.id);

        return (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveFilter(filter.id)}
            className={`relative px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-bg-card text-text-primary border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/50'
            }`}
          >
            <span>{filter.label}</span>
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-border-subtle text-text-secondary'
                  : 'bg-bg-card text-text-muted'
              }`}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
