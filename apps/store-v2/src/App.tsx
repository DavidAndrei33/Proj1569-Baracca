import { useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { useKDSStore } from './store';
import { useOrders } from './hooks/useOrders';
import { useIsMobile } from './hooks/useIsMobile';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { FilterTabs } from './components/FilterTabs';
import { ConnectionBanner } from './components/ConnectionBanner';
import { KanbanColumn } from './components/KanbanColumn';
import { MobileOrderList } from './components/MobileOrderList';
import LoginPage from './pages/LoginPage';
import ReservationsPage from './pages/ReservationsPage';
import type { OrderStatus } from './types';

const orderColumns: {
  status: OrderStatus;
  title: string;
  textColor: string;
  bgColor: string;
  badgeBg: string;
  columnBg: string;
}[] = [
  {
    status: 'RECEIVED',
    title: 'Comenzi Noi',
    textColor: 'text-status-new',
    bgColor: 'bg-status-new',
    badgeBg: 'bg-status-new/15',
    columnBg: 'bg-status-new/[0.02]',
  },
  {
    status: 'ACCEPTED',
    title: 'Acceptate',
    textColor: 'text-[#06b6d4]',
    bgColor: 'bg-[#06b6d4]',
    badgeBg: 'bg-[#06b6d4]/15',
    columnBg: 'bg-[#06b6d4]/[0.02]',
  },
  {
    status: 'PREPARING',
    title: 'În Preparare',
    textColor: 'text-status-preparing',
    bgColor: 'bg-status-preparing',
    badgeBg: 'bg-status-preparing/15',
    columnBg: 'bg-status-preparing/[0.02]',
  },
  {
    status: 'READY',
    title: 'Gata de Ridicare',
    textColor: 'text-status-ready',
    bgColor: 'bg-status-ready',
    badgeBg: 'bg-status-ready/15',
    columnBg: 'bg-status-ready/[0.02]',
  },
  {
    status: 'PICKED_UP',
    title: 'Ridicate',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-400',
    badgeBg: 'bg-cyan-400/15',
    columnBg: 'bg-cyan-400/[0.02]',
  },
  {
    status: 'CANCELLED',
    title: 'Anulate',
    textColor: 'text-red-400',
    bgColor: 'bg-red-400',
    badgeBg: 'bg-red-400/15',
    columnBg: 'bg-red-400/[0.02]',
  },
];

function KDSApp() {
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations'>('orders');
  const { orders } = useKDSStore();
  const setOrders = useKDSStore((s) => s.setOrders);
  const setIsOnline = useKDSStore((s) => s.setIsOnline);
  const isMobile = useIsMobile();
  const { data, isSuccess, isError } = useOrders(true);

  useEffect(() => {
    if (isSuccess && data) {
      setOrders(data);
      setIsOnline(true);
    }
    if (isError) {
      setIsOnline(false);
    }
  }, [data, isSuccess, isError, setOrders, setIsOnline]);

  const getOrdersByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.status === status);

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <ConnectionBanner />

      {activeTab === 'orders' && (
        <>
          <FilterTabs />
          {isMobile ? (
            <MobileOrderList />
          ) : (
            <div className="flex-1 overflow-hidden px-6 pb-5 pt-2">
              <div className="flex gap-3 h-full overflow-x-auto">
                {orderColumns.map((col) => (
                  <KanbanColumn
                    key={col.status}
                    status={col.status}
                    title={col.title}
                    textColor={col.textColor}
                    bgColor={col.bgColor}
                    badgeBg={col.badgeBg}
                    columnBg={col.columnBg}
                    orders={getOrdersByStatus(col.status)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'reservations' && (
        <div className="flex-1 overflow-hidden">
          <ReservationsPage />
        </div>
      )}
    </div>
  );
}

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <KDSApp />;
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
