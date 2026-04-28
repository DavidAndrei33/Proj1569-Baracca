import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import StickyCart from './components/StickyCart';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ReservationPage from './pages/ReservationPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#0a0a0e]">
          <Header />
          <CartDrawer />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/meniu" element={<MenuPage />} />
              <Route path="/cos" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/comanda-confirmata" element={<OrderSuccessPage />} />
              <Route path="/rezervare" element={<ReservationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/inregistrare" element={<RegisterPage />} />
              <Route path="/cont" element={<AccountPage />} />
              <Route path="/comanda/:id" element={<OrderTrackingPage />} />
            </Routes>
          </main>
          <Footer />
          <StickyCart />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
