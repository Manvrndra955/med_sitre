import React from 'react';
import { Pill, ShieldCheck, Heart, Clock, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
              <Pill className="w-5 h-5 rotate-45" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">MediQuick</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your trusted online retail pharmacy store providing authentic medicines, fast doorstep delivery, and custom medicine request services.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Our Guarantees</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Genuine Medicines</li>
            <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-400" /> Same-Day Express Delivery</li>
            <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> Dedicated Pharmacist Assistance</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Customer Support</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-cyan-400" /> Toll Free: 1800-MED-QUICK</li>
            <li>Email: support@medstore.com</li>
            <li>Available 24 Hours / 7 Days</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Compliance & Quality</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Licensed retail pharmacy store operating in strict accordance with healthcare regulations and prescription validation safety standards.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MediQuick Pharmacy Retail Store. All rights reserved.
      </div>
    </footer>
  );
}
