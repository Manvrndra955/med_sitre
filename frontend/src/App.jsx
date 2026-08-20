import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserRequests from './pages/UserRequests';
import UserOrders from './pages/UserOrders';
import AdminDashboard from './pages/AdminDashboard';

function MainAppContent() {
  const { user, isAdmin } = useAuth();
  const [activePage, setActivePage] = useState('catalog');
  const [prefilledReqName, setPrefilledReqName] = useState('');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(false);

  const handleRequestMedicineClick = (medicineTitle) => {
    setPrefilledReqName(medicineTitle || '');
    if (!user) {
      setActivePage('login');
    } else {
      setActivePage('requests');
    }
  };

  const handleOrderSuccess = () => {
    setOrderSuccessMsg(true);
    setActivePage('orders');
    setTimeout(() => setOrderSuccessMsg(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Message on Order Success */}
      {orderSuccessMsg && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2.5 px-4 text-xs font-bold shadow-md animate-fade-in flex items-center justify-center gap-2">
          <span>🎉 Congratulations! Your bulk medicine order has been placed successfully and dispatched for packaging!</span>
        </div>
      )}

      {/* Header Navbar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {activePage === 'catalog' && (
          <Catalog onRequestMedicineClick={handleRequestMedicineClick} />
        )}

        {activePage === 'login' && (
          <Login
            onNavigateSignup={() => setActivePage('signup')}
            onLoginSuccess={(u) => {
              if (u.role === 'admin') setActivePage('admin');
              else setActivePage('catalog');
            }}
          />
        )}

        {activePage === 'signup' && (
          <Signup
            onNavigateLogin={() => setActivePage('login')}
            onSignupSuccess={(u) => {
              if (u.role === 'admin') setActivePage('admin');
              else setActivePage('catalog');
            }}
          />
        )}

        {activePage === 'requests' && (
          <UserRequests initialMedicineName={prefilledReqName} />
        )}

        {activePage === 'orders' && (
          <UserOrders />
        )}

        {activePage === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="py-20 text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">Admin Privileges Required</h2>
              <p className="text-xs text-slate-500">Please log in with an Administrator account to access the Admin Control Center.</p>
              <button
                onClick={() => setActivePage('login')}
                className="px-6 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Go to Login Page
              </button>
            </div>
          )
        )}

      </main>

      {/* Sliding Cart Drawer */}
      <CartDrawer
        onOrderSuccess={handleOrderSuccess}
        onNavigateLogin={() => setActivePage('login')}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
