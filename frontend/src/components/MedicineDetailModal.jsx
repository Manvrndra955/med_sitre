import React, { useState } from 'react';
import { X, ShoppingBag, ShieldAlert, CheckCircle2, AlertTriangle, FileText, Info, Stethoscope, AlertCircle, Calendar, Hash, Factory, Activity, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MedicineDetailModal({ medicine, onClose, onRequestMedicine }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  if (!medicine) return null;

  const isOutOfStock = medicine.stock <= 0;
  const isLowStock = medicine.stock > 0 && medicine.stock <= 10;

  // Check if expiring soon (within 60 days)
  const isExpiringSoon = medicine.expiryDate && new Date(medicine.expiryDate) - new Date() < 60 * 24 * 60 * 60 * 1000;

  const handleAddToCart = () => {
    addToCart(medicine, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 transform transition-all scale-100">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-700 to-emerald-600 p-6 text-white flex items-start justify-between">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
              {medicine.category}
            </span>
            <h2 className="text-2xl font-bold">{medicine.title}</h2>
            <p className="text-teal-100 text-sm mt-1">₹{medicine.price.toFixed(2)} per unit</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Info Bar & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {isOutOfStock ? (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Only {medicine.stock} left!
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({medicine.stock})
                </span>
              )}

              {isExpiringSoon && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Exp: {medicine.expiryDate}
                </span>
              )}

              {medicine.requiresPrescription && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5" /> Rx Required
                </span>
              )}
            </div>

            <span className="text-2xl font-extrabold text-teal-800">
              ₹{medicine.price.toFixed(2)}
            </span>
          </div>

          {/* Batch & Composition Metadata Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold block flex items-center gap-1">
                <Hash className="w-3 h-3 text-teal-600" /> Batch No:
              </span>
              <strong className="text-slate-700 font-mono">{medicine.batchNumber || 'BTC-2026-X'}</strong>
            </div>

            <div>
              <span className="text-slate-400 font-bold block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-teal-600" /> Expiry Date:
              </span>
              <strong className="text-slate-700">{medicine.expiryDate || '2027-12-31'}</strong>
            </div>

            <div>
              <span className="text-slate-400 font-bold block flex items-center gap-1">
                <Factory className="w-3 h-3 text-teal-600" /> Manufacturer:
              </span>
              <strong className="text-slate-700 truncate block">{medicine.manufacturer || 'Apex Pharma'}</strong>
            </div>

            <div>
              <span className="text-slate-400 font-bold block flex items-center gap-1">
                <Activity className="w-3 h-3 text-teal-600" /> Active Formula:
              </span>
              <strong className="text-slate-700 truncate block">{medicine.composition || 'Active Salt'}</strong>
            </div>
          </div>

          {/* Generic Substitute Banner if applicable */}
          {medicine.genericSubstituteName && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Save ~35% by asking for generic formula: <strong>{medicine.genericSubstituteName}</strong></span>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'description'
                  ? 'border-b-2 border-teal-600 text-teal-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Info className="w-4 h-4" /> Description
            </button>
            <button
              onClick={() => setActiveTab('uses')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'uses'
                  ? 'border-b-2 border-teal-600 text-teal-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" /> Uses & Dosage
            </button>
            <button
              onClick={() => setActiveTab('precautions')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'precautions'
                  ? 'border-b-2 border-teal-600 text-teal-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> Precautions
            </button>
          </div>

          {/* Tab Content */}
          <div className="text-slate-700 leading-relaxed min-h-[100px]">
            {activeTab === 'description' && (
              <div className="space-y-3">
                <p className="text-base text-slate-800">{medicine.description}</p>
                {medicine.symptoms && medicine.symptoms.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs font-bold text-slate-400">Targets Symptoms:</span>
                    <div className="flex flex-wrap gap-1">
                      {medicine.symptoms.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[11px] font-bold rounded-lg border border-teal-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'uses' && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Medical Uses</h4>
                  <p className="text-sm bg-teal-50/60 text-teal-900 p-3 rounded-xl border border-teal-100">
                    {medicine.uses || 'Used for general healthcare and relief as directed by physician.'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Recommended Dosage</h4>
                  <p className="text-sm bg-blue-50/60 text-blue-900 p-3 rounded-xl border border-blue-100">
                    {medicine.dosage || 'Take as prescribed by healthcare professional.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'precautions' && (
              <div className="bg-amber-50 text-amber-900 p-4 rounded-xl border border-amber-200 text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>Important Safety Guidelines</span>
                </div>
                <p>{medicine.precautions || 'Consult a healthcare provider before use. Keep out of reach of children.'}</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          {!isOutOfStock ? (
            <>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-sm">
                <span className="text-xs font-bold text-slate-500">Qty:</span>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart • ₹{(medicine.price * quantity).toFixed(2)}
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Medicine currently unavailable in stock.</p>
              <button
                onClick={() => {
                  onClose();
                  onRequestMedicine(medicine.title);
                }}
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-sm"
              >
                <FileText className="w-4 h-4" /> Request Restock From Admin
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
