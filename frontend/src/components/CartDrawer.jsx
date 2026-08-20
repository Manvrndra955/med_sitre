import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, MapPin, ArrowRight, ShoppingBag, ShieldCheck, CreditCard, QrCode, Building2, Banknote, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../api';

export default function CartDrawer({ onOrderSuccess, onNavigateLogin }) {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount, isCartOpen, setIsCartOpen } = useCart();
  const { user, updateUserAddress } = useAuth();

  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'CARD', 'NETBANKING', 'COD'
  
  // Payment Simulation Inputs
  const [upiId, setUpiId] = useState('user@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.address) {
      setAddress({
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        pincode: user.address.pincode || ''
      });
    }
  }, [user]);

  if (!isCartOpen) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      setIsCartOpen(false);
      onNavigateLogin();
      return;
    }

    if (!address.street || !address.city || !address.pincode) {
      setError('Please provide a complete delivery address.');
      setIsEditingAddress(true);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderItems = cart.map(item => ({
        medicineId: item.medicineId,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      }));

      const txnId = paymentMethod === 'COD' ? 'N/A' : `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const payStatus = paymentMethod === 'COD' ? 'pending' : 'paid';

      await placeOrder({
        items: orderItems,
        deliveryAddress: address,
        totalAmount,
        paymentMethod,
        paymentStatus: payStatus,
        transactionId: txnId
      });

      updateUserAddress(address);
      clearCart();
      setIsCartOpen(false);
      onOrderSuccess();
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 bg-gradient-to-r from-teal-700 to-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Your Medicine Cart</h3>
                <p className="text-xs text-teal-100">{cart.length} unique medicine items</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-700">Your cart is empty</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Browse our catalog and add the medicines you need. You can order them all at once!
                </p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</h4>
                  {cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-teal-200 transition-colors"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-slate-800 truncate">{item.title}</h5>
                        <p className="text-xs text-teal-700 font-semibold mt-0.5">₹{item.price.toFixed(2)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                          className="p-1 text-slate-600 hover:text-red-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                          className="p-1 text-slate-600 hover:text-teal-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.medicineId)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Delivery Address Section */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <MapPin className="w-4 h-4 text-teal-600" /> Delivery Address
                    </div>
                    <button
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="text-xs font-bold text-teal-600 hover:underline"
                    >
                      {isEditingAddress ? 'Save Address' : 'Change Address'}
                    </button>
                  </div>

                  {isEditingAddress ? (
                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-teal-200">
                      <input
                        type="text"
                        placeholder="Street / House No / Flat"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Pincode / Postal Code"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold">{address.street || 'No street address specified'}</p>
                      <p>{address.city ? `${address.city}, ${address.state} - ${address.pincode}` : 'Click change to add address'}</p>
                    </div>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-600" /> Select Payment Method
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        paymentMethod === 'UPI'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-teal-600" /> UPI / QR Code
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        paymentMethod === 'CARD'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-indigo-600" /> Card (Credit/Debit)
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        paymentMethod === 'NETBANKING'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-cyan-600" /> NetBanking
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        paymentMethod === 'COD'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600" /> Cash on Delivery
                    </button>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1">
                      <span className="font-bold block">📲 Instant UPI Transfer</span>
                      <p className="text-[11px] text-teal-800">Simulating instant payment via GPay, PhonePe, or Paytm UPI ID: <code>{upiId}</code></p>
                    </div>
                  )}

                  {paymentMethod === 'CARD' && (
                    <div className="bg-indigo-50/80 p-3 rounded-xl border border-indigo-200 text-xs text-indigo-900 space-y-1">
                      <span className="font-bold block">💳 Secure Card Gateway</span>
                      <p className="text-[11px] text-indigo-800">Card ending: <code>{cardNumber}</code> • Verified by Visa/Mastercard</p>
                    </div>
                  )}

                  {paymentMethod === 'COD' && (
                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                      <span>💵 Pay ₹{totalAmount.toFixed(2)} in cash to the delivery agent upon package arrival.</span>
                    </div>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Medicines Subtotal</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-600 font-semibold">FREE Express</span>
                  </div>
                  <div className="pt-2 border-t border-teal-200/80 flex justify-between font-extrabold text-base text-teal-900">
                    <span>Total Pay Amount</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing Payment & Order...</span>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount.toFixed(2)} & Order All</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-3">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>SSL Encrypted • Instant Email Receipt Dispatched</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
