import React from 'react';
import { Pill, ShoppingBag, User, LogOut, ShieldAlert, FileQuestion, Package, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, isAdmin } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('catalog')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Pill className="w-6 h-6 rotate-45" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-700 bg-clip-text text-transparent">
              MediQuick
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-teal-600">Online Pharmacy</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60">
          <button
            onClick={() => setActivePage('catalog')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activePage === 'catalog'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-teal-600'
            }`}
          >
            <Home className="w-4 h-4" />
            Medicines
          </button>

          {user && !isAdmin && (
            <>
              <button
                onClick={() => setActivePage('requests')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activePage === 'requests'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
              >
                <FileQuestion className="w-4 h-4" />
                Request Medicine
              </button>

              <button
                onClick={() => setActivePage('orders')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activePage === 'orders'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
              >
                <Package className="w-4 h-4" />
                My Orders
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => setActivePage('admin')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activePage === 'admin'
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                  : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Right Actions: Cart & User Profile */}
        <div className="flex items-center gap-3">
          
          {/* Cart Icon Button */}
          {!isAdmin && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>
          )}

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {user.role === 'admin' ? '⚡ Admin' : 'Customer'}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('login')}
                className="px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setActivePage('signup')}
                className="px-4 py-2 text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-sm transition-all"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
