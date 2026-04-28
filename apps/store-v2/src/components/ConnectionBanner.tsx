import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useKDSStore } from '../store';

export function ConnectionBanner() {
  const isOnline = useKDSStore((s) => s.isOnline);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-status-new/10 border-b border-status-new/30 overflow-hidden"
        >
          <div className="px-6 py-2 flex items-center gap-2 text-status-new text-sm font-medium">
            <WifiOff className="w-4 h-4" />
            <span>Conexiune pierdută. Încercăm reconectarea...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
