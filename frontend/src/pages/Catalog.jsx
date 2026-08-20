import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Eye, CheckCircle2, AlertTriangle, Sparkles, Filter, AlertCircle, FileQuestion, Activity, Calendar, Zap } from 'lucide-react';
import { fetchMedicines } from '../api';
import { useCart } from '../context/CartContext';
import MedicineDetailModal from '../components/MedicineDetailModal';

const CATEGORIES = ['All', 'Pain Relief', 'Antibiotics', 'Vitamins & Supplements', 'Allergy & Cold', 'Digestive Health', 'Healthcare Devices'];
const QUICK_SYMPTOMS = ['All Symptoms', 'Fever', 'Headache', 'Cold & Cough', 'Acidity', 'Fatigue', 'Body Ache'];

export default function Catalog({ onRequestMedicineClick }) {
  const { addToCart } = useCart();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSymptom, setSelectedSymptom] = useState('All Symptoms');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const symParam = selectedSymptom === 'All Symptoms' ? '' : selectedSymptom;
      const data = await fetchMedicines(selectedCategory, searchQuery, symParam);
      setMedicines(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, [selectedCategory, selectedSymptom]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMedicines();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Eye-catching Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-800 text-white p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-extrabold uppercase tracking-widest border border-white/10">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            24/7 Verified Medicine Store
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Healthcare Delivered Fast To Your Doorstep
          </h1>
          <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
            Order authentic prescription & over-the-counter medicines with active formula breakdown, batch dates, and instant delivery.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search medicines by title, chemical composition, or manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white text-slate-800 placeholder-slate-400 rounded-2xl shadow-lg focus:ring-4 focus:ring-teal-400/50 outline-none text-sm font-semibold"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-2xl shadow-lg transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Symptom Quick Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-teal-600" /> Filter By Symptom You Are Experiencing:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_SYMPTOMS.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymptom(sym)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSymptom === sym
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
              }`}
            >
              {sym === 'All Symptoms' ? '✨ All Symptoms' : `🤒 ${sym}`}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Categories:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">Loading available medicines...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching medicines found</h3>
          <p className="text-xs text-slate-500">
            Couldn't find the medicine you're looking for? Submit a special query to our admin to request it with your needed due date!
          </p>
          <button
            onClick={() => onRequestMedicineClick('')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <FileQuestion className="w-4 h-4" /> Request Unlisted Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((med) => {
            const isOutOfStock = med.stock <= 0;
            const isLowStock = med.stock > 0 && med.stock <= 10;
            const isExpiringSoon = med.expiryDate && new Date(med.expiryDate) - new Date() < 60 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={med._id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-teal-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Image & Badges */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={med.image}
                    alt={med.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-teal-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {med.category}
                  </span>

                  {/* Stock Pill */}
                  <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Low Stock ({med.stock} left)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> In Stock ({med.stock})
                      </span>
                    )}

                    {isExpiringSoon && (
                      <span className="px-2 py-0.5 bg-orange-600/90 backdrop-blur-md text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Exp: {med.expiryDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                      {med.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {med.description}
                    </p>

                    {med.composition && (
                      <span className="block text-[11px] text-teal-700 font-semibold mt-1">
                        Formula: {med.composition}
                      </span>
                    )}

                    {med.genericSubstituteName && (
                      <span className="inline-block text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 mt-2">
                        <Zap className="w-3 h-3 inline mr-1" /> Generic alternative available
                      </span>
                    )}
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">Price</span>
                      <span className="text-xl font-extrabold text-teal-800">
                        ₹{med.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMedicine(med)}
                        className="p-2.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                        title="View Details & Batch Info"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {!isOutOfStock ? (
                        <button
                          onClick={() => addToCart(med, 1)}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all"
                        >
                          <ShoppingBag className="w-4 h-4" /> Add to Cart
                        </button>
                      ) : (
                        <button
                          onClick={() => onRequestMedicineClick(med.title)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-all"
                          title="Request this out-of-stock medicine from admin"
                        >
                          Request Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal preview */}
      {selectedMedicine && (
        <MedicineDetailModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
          onRequestMedicine={(title) => {
            setSelectedMedicine(null);
            onRequestMedicineClick(title);
          }}
        />
      )}

    </div>
  );
}
