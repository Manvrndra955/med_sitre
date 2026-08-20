import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, MapPin, ShoppingBag } from 'lucide-react';
import { fetchUserOrders } from '../api';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchUserOrders();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white rounded-3xl p-8 shadow-xl flex items-center justify-between">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-2">
            Order Tracking & History
          </span>
          <h1 className="text-3xl font-extrabold">My Placed Orders</h1>
          <p className="text-teal-100 text-sm mt-1">Track delivery status and review your past medicine orders.</p>
        </div>
        <Package className="w-12 h-12 text-teal-200 hidden sm:block" />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No orders placed yet</h3>
          <p className="text-xs text-slate-500">Go to the medicine catalog to place your first order!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-teal-200 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                  <span className="font-mono text-xs font-bold text-slate-800">{ord._id}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    ord.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.status}
                  </span>
                </div>
              </div>

              {/* Items breakdown */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Medicines</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-700 truncate">{item.title}</span>
                      <span className="text-slate-500 shrink-0 ml-2">Qty: {item.quantity} × ₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer details */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Deliver to: {ord.deliveryAddress.street}, {ord.deliveryAddress.city}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 mr-2">Total Amount:</span>
                  <span className="text-lg font-extrabold text-teal-800">₹{ord.totalAmount.toFixed(2)}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
