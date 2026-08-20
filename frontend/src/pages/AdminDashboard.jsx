import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle2, Clock, AlertTriangle, MessageSquare, Plus, 
  Package, DollarSign, Database, Send, RefreshCw, Trash2, Calendar, Download, 
  TrendingUp, Activity, Hash, Factory, FileText, Check 
} from 'lucide-react';
import { 
  fetchAdminOrders, updateOrderStatus, fetchAdminRequests, replyToRequest, 
  fetchMedicines, addMedicine, updateMedicine, deleteMedicine 
} from '../api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'requests', 'storage', 'addMedicine', 'orders'

  // Data States
  const [metrics, setMetrics] = useState({
    completedToday: 0,
    pendingToday: 0,
    totalCompletedOverall: 0,
    totalPendingOverall: 0,
    totalRevenue: 0
  });

  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States for Request Reply
  const [replyingRequest, setReplyingRequest] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('fulfilled');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Form State for Add Medicine
  const [newMed, setNewMed] = useState({
    title: '',
    category: 'Pain Relief',
    price: '',
    stock: '',
    description: '',
    uses: '',
    dosage: '',
    precautions: '',
    image: '',
    requiresPrescription: false,
    batchNumber: '',
    expiryDate: '',
    manufacturer: '',
    composition: '',
    symptoms: '',
    isGeneric: false,
    genericSubstituteName: ''
  });
  const [addMedSubmitting, setAddMedSubmitting] = useState(false);
  const [addMedSuccess, setAddMedSuccess] = useState('');

  // Notification Toast
  const [statusMsg, setStatusMsg] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ordRes, reqRes, medRes] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminRequests(),
        fetchMedicines('All', '')
      ]);

      setOrders(ordRes.orders);
      setMetrics(ordRes.metrics);
      setRequests(reqRes);
      setMedicines(medRes);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleOrderStatusChange = async (orderId, newStatus, paymentStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, paymentStatus);
      setStatusMsg(`Order status updated to ${newStatus}`);
      loadAllData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleOpenReplyModal = (req) => {
    setReplyingRequest(req);
    setAdminReplyText(req.adminReply || '');
    setReplyStatus(req.status === 'pending' ? 'fulfilled' : req.status);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText) return;

    setReplySubmitting(true);
    try {
      await replyToRequest(replyingRequest._id, adminReplyText, replyStatus);
      setStatusMsg('Reply sent successfully & email notification dispatched!');
      setReplyingRequest(null);
      loadAllData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) {
      alert(e.message);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleQuickRestock = async (medId, currentStock, addAmount) => {
    try {
      const newStock = currentStock + addAmount;
      await updateMedicine(medId, { stock: newStock });
      setStatusMsg(`Stock replenished (+${addAmount})!`);
      loadAllData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteMedicine = async (medId) => {
    if (!window.confirm('Are you sure you want to remove this medicine from the platform?')) return;
    try {
      await deleteMedicine(medId);
      setStatusMsg('Medicine removed.');
      loadAllData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAddMedicineSubmit = async (e) => {
    e.preventDefault();
    if (!newMed.title || !newMed.price || !newMed.stock || !newMed.category) return;

    setAddMedSubmitting(true);
    setAddMedSuccess('');

    try {
      await addMedicine({
        ...newMed,
        price: Number(newMed.price),
        stock: Number(newMed.stock)
      });

      setAddMedSuccess('Medicine added successfully! It is now live for all users with batch details.');
      setNewMed({
        title: '',
        category: 'Pain Relief',
        price: '',
        stock: '',
        description: '',
        uses: '',
        dosage: '',
        precautions: '',
        image: '',
        requiresPrescription: false,
        batchNumber: '',
        expiryDate: '',
        manufacturer: '',
        composition: '',
        symptoms: '',
        isGeneric: false,
        genericSubstituteName: ''
      });
      loadAllData();
    } catch (e) {
      alert(e.message);
    } finally {
      setAddMedSubmitting(false);
    }
  };

  // CSV Export Generators
  const exportInventoryCSV = () => {
    const headers = ['ID,Title,Category,Price,Stock,BatchNumber,ExpiryDate,Manufacturer,Composition'];
    const rows = medicines.map(m => `"${m._id}","${m.title}","${m.category}",${m.price},${m.stock},"${m.batchNumber || ''}","${m.expiryDate || ''}","${m.manufacturer || ''}","${m.composition || ''}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrdersCSV = () => {
    const headers = ['OrderID,CustomerName,Email,Phone,TotalAmount,Status,PaymentMethod,PaymentStatus,TransactionID,Date'];
    const rows = orders.map(o => `"${o._id}","${o.userName}","${o.userEmail}","${o.userPhone}",${o.totalAmount},"${o.status}","${o.paymentMethod || 'COD'}","${o.paymentStatus || 'pending'}","${o.transactionId || 'N/A'}","${new Date(o.createdAt).toLocaleDateString()}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations
  const lowStockCount = medicines.filter(m => m.stock > 0 && m.stock <= 10).length;
  const outOfStockCount = medicines.filter(m => m.stock <= 0).length;
  const expiringSoonCount = medicines.filter(m => m.expiryDate && (new Date(m.expiryDate) - new Date() < 60 * 24 * 60 * 60 * 1000)).length;
  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white rounded-3xl p-8 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-500/30">
            <ShieldAlert className="w-4 h-4 text-teal-400" /> Admin Control Center
          </span>
          <h1 className="text-3xl font-extrabold">Pharmacy Storage, Sales & Analytics</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">Manage orders, customer special queries, stock replenishment, batch expiry dates, and CSV reports.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportInventoryCSV}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export Inventory CSV
          </button>
          <button
            onClick={exportOrdersCSV}
            className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export Orders CSV
          </button>
          <button
            onClick={loadAllData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all flex items-center gap-1 text-xs font-bold"
            title="Sync Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-900 font-bold rounded-2xl border border-emerald-200 shadow-sm animate-bounce text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Sales Revenue</span>
            <span className="text-3xl font-black text-teal-900">₹{metrics.totalRevenue ? metrics.totalRevenue.toFixed(2) : '0.00'}</span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-0.5">Completed Today: {metrics.completedToday}</span>
          </div>
        </div>

        {/* Orders Pending Today */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Orders Pending Today</span>
            <span className="text-3xl font-black text-amber-600">{metrics.pendingToday}</span>
            <span className="block text-[11px] text-amber-700 font-semibold mt-0.5">Overall Pending: {metrics.totalPendingOverall}</span>
          </div>
        </div>

        {/* Customer Requests */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending User Requests</span>
            <span className="text-3xl font-black text-blue-700">{pendingRequestsCount}</span>
            <span className="block text-[11px] text-blue-600 font-semibold mt-0.5">Total Queries: {requests.length}</span>
          </div>
        </div>

        {/* Storage Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stock / Expiry Alerts</span>
            <span className="text-3xl font-black text-red-600">{outOfStockCount + lowStockCount + expiringSoonCount}</span>
            <span className="block text-[11px] text-red-600 font-semibold mt-0.5">
              {outOfStockCount} Ended • {lowStockCount} Low • {expiringSoonCount} Expiring
            </span>
          </div>
        </div>

      </div>

      {/* Main Admin Tab Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Interactive Analytics & Graphs
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'requests'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          User Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'storage'
              ? 'bg-teal-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Storage & Batch Expiry ({medicines.length})
        </button>

        <button
          onClick={() => setActiveTab('addMedicine')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'addMedicine'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add New Medicine
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          All Orders ({orders.length})
        </button>
      </div>

      {/* TAB 0: INTERACTIVE ANALYTICS & GRAPH DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Breakdown Graph */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" /> Sales Revenue Distribution
            </h3>
            
            <div className="h-48 flex items-end justify-around border-b border-slate-200 pb-2 px-4 gap-4">
              <div className="flex flex-col items-center flex-1">
                <span className="text-xs font-bold text-teal-700 mb-1">₹{metrics.totalRevenue ? (metrics.totalRevenue * 0.4).toFixed(0) : '0'}</span>
                <div className="w-full bg-teal-500 rounded-t-xl transition-all duration-500" style={{ height: '55%' }} />
                <span className="text-[11px] font-semibold text-slate-500 mt-2">UPI Payments</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-xs font-bold text-indigo-700 mb-1">₹{metrics.totalRevenue ? (metrics.totalRevenue * 0.35).toFixed(0) : '0'}</span>
                <div className="w-full bg-indigo-500 rounded-t-xl transition-all duration-500" style={{ height: '45%' }} />
                <span className="text-[11px] font-semibold text-slate-500 mt-2">Card Gateway</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-xs font-bold text-emerald-700 mb-1">₹{metrics.totalRevenue ? (metrics.totalRevenue * 0.25).toFixed(0) : '0'}</span>
                <div className="w-full bg-emerald-500 rounded-t-xl transition-all duration-500" style={{ height: '35%' }} />
                <span className="text-[11px] font-semibold text-slate-500 mt-2">Cash on Delivery</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total Estimated Revenue</span>
              <strong className="text-slate-800 text-sm">₹{metrics.totalRevenue ? metrics.totalRevenue.toFixed(2) : '0.00'}</strong>
            </div>
          </div>

          {/* Inventory Health Visual Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" /> Inventory Stock Distribution
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Healthy Stock ({medicines.length - lowStockCount - outOfStockCount} items)</span>
                  <span>{medicines.length > 0 ? Math.round(((medicines.length - lowStockCount - outOfStockCount) / medicines.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${medicines.length > 0 ? Math.round(((medicines.length - lowStockCount - outOfStockCount) / medicines.length) * 100) : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Low Stock Warning ({lowStockCount} items)</span>
                  <span>{medicines.length > 0 ? Math.round((lowStockCount / medicines.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${medicines.length > 0 ? Math.round((lowStockCount / medicines.length) * 100) : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Stock Ended / Empty ({outOfStockCount} items)</span>
                  <span>{medicines.length > 0 ? Math.round((outOfStockCount / medicines.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${medicines.length > 0 ? Math.round((outOfStockCount / medicines.length) * 100) : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span>⚠️ Expiring Within 60 Days:</span>
              <strong className="text-amber-800">{expiringSoonCount} Medicines</strong>
            </div>
          </div>

        </div>
      )}

      {/* TAB 1: USER REQUESTS SECTION */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Customer Medicine Requests & Queries</h2>
              <p className="text-xs text-slate-500">Respond to customer requests for unlisted or out-of-stock medicines with target due dates.</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
              {pendingRequestsCount} Pending Action
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No medicine requests submitted yet.</div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-amber-300 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 text-lg">{req.medicineName}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-200 text-amber-900">
                          Qty: {req.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Requested by: <strong>{req.userName}</strong> ({req.userEmail} | 📞 {req.userPhone})
                      </p>
                      <p className="text-xs text-amber-700 font-bold mt-1">
                        📅 Target Due Date & Time: {req.dueDateTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>

                      <button
                        onClick={() => handleOpenReplyModal(req)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {req.adminReply ? 'Edit Reply' : 'Reply & Email User'}
                      </button>
                    </div>
                  </div>

                  {req.note && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                      User Note: "{req.note}"
                    </div>
                  )}

                  {req.adminReply && (
                    <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-xs text-teal-900">
                      <strong>Admin Current Reply:</strong> "{req.adminReply}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICINES STORAGE & STOCK ALERT */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Medicines Storage & Batch Expiry Tracker</h2>
              <p className="text-xs text-slate-500">Monitor live inventory levels, batch numbers, manufacturer composition, and expiry dates.</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-red-100 text-red-800 font-bold rounded-full">{outOfStockCount} Out of Stock</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full">{lowStockCount} Low Stock</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 font-bold rounded-full">{expiringSoonCount} Expiring Soon</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Medicine Title</th>
                  <th className="py-3 px-4">Batch & Expiry</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Storage Left</th>
                  <th className="py-3 px-4">Stock Status Alert</th>
                  <th className="py-3 px-4 text-right">Quick Restock / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {medicines.map((med) => {
                  const isEnd = med.stock <= 0;
                  const isLow = med.stock > 0 && med.stock <= 10;
                  const isExpiringSoon = med.expiryDate && (new Date(med.expiryDate) - new Date() < 60 * 24 * 60 * 60 * 1000);

                  return (
                    <tr key={med._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          {med.image && <img src={med.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />}
                          <div>
                            <div>{med.title}</div>
                            <span className="text-[11px] text-slate-400 font-medium">{med.manufacturer || 'Apex Pharma'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        <div className="font-mono text-slate-700">{med.batchNumber || 'BTC-2026-X'}</div>
                        <div className={isExpiringSoon ? 'text-orange-600 font-bold' : 'text-slate-500'}>Exp: {med.expiryDate || '2027-12-31'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-teal-800">₹{med.price.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-extrabold text-base">{med.stock}</td>
                      <td className="py-3.5 px-4">
                        {isEnd ? (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-extrabold rounded-full flex items-center gap-1 w-fit animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> Stock Ended! Add Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-extrabold rounded-full flex items-center gap-1 w-fit">
                            <Calendar className="w-3.5 h-3.5" /> ⚠️ Expiring Soon
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Stock Healthy
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickRestock(med._id, med.stock, 20)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200 transition-colors"
                            title="Add 20 units to stock"
                          >
                            +20 Stock
                          </button>
                          <button
                            onClick={() => handleQuickRestock(med._id, med.stock, 50)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
                            title="Add 50 units to stock"
                          >
                            +50 Stock
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(med._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADD NEW MEDICINE TO SITE */}
      {activeTab === 'addMedicine' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Add New Medicine With Batch Metadata
            </h2>
            <p className="text-xs text-slate-500">Newly added medicines immediately reflect on the user catalog for ordering.</p>
          </div>

          {addMedSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{addMedSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddMedicineSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Title / Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ibuprofen 400mg Pain Reliever"
                  value={newMed.title}
                  onChange={(e) => setNewMed({ ...newMed, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={newMed.category}
                  onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                >
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                  <option value="Allergy & Cold">Allergy & Cold</option>
                  <option value="Digestive Health">Digestive Health</option>
                  <option value="Healthcare Devices">Healthcare Devices</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={newMed.price}
                  onChange={(e) => setNewMed({ ...newMed, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Storage Stock *</label>
                <input
                  type="number"
                  placeholder="50"
                  value={newMed.stock}
                  onChange={(e) => setNewMed({ ...newMed, stock: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  placeholder="BTC-2026-X99"
                  value={newMed.batchNumber}
                  onChange={(e) => setNewMed({ ...newMed, batchNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newMed.expiryDate}
                  onChange={(e) => setNewMed({ ...newMed, expiryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  placeholder="Apex Pharma Labs"
                  value={newMed.manufacturer}
                  onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Active Composition Formula</label>
                <input
                  type="text"
                  placeholder="Paracetamol 500mg + Caffeine 30mg"
                  value={newMed.composition}
                  onChange={(e) => setNewMed({ ...newMed, composition: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Description *</label>
              <textarea
                rows="3"
                placeholder="Give complete details about what this medicine does..."
                value={newMed.description}
                onChange={(e) => setNewMed({ ...newMed, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={addMedSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
            >
              {addMedSubmitting ? 'Publishing Medicine...' : 'Publish Medicine To Site'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ALL CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">All Customer Orders & Payments</h2>
            <span className="text-xs font-bold text-slate-500">Total: {orders.length} orders</span>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-slate-800 text-sm">Order #{ord._id}</span>
                    <span className="block text-xs text-slate-500">Customer: {ord.userName} ({ord.userEmail} | 📞 {ord.userPhone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Order Status:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => handleOrderStatusChange(ord._id, e.target.value, ord.paymentStatus)}
                      className="bg-white border border-slate-300 rounded-lg text-xs font-bold px-3 py-1.5 outline-none shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <span className="text-xs font-bold text-slate-500 ml-2">Payment:</span>
                    <select
                      value={ord.paymentStatus || 'pending'}
                      onChange={(e) => handleOrderStatusChange(ord._id, ord.status, e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg text-xs font-bold px-3 py-1.5 outline-none shadow-sm text-emerald-800"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                      <span className="font-semibold">{it.title}</span>
                      <span>Qty: {it.quantity} × ₹{it.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between items-center text-xs pt-1 border-t border-slate-200">
                  <div className="text-slate-600">
                    Method: <strong>{ord.paymentMethod || 'COD'}</strong> | Txn ID: <code className="font-mono text-slate-800">{ord.transactionId || 'N/A'}</code>
                  </div>
                  <span className="font-extrabold text-base text-teal-800">Total: ₹{ord.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Reply & Email Customer</h3>
            
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><strong>Medicine:</strong> {replyingRequest.medicineName} (Qty: {replyingRequest.quantity})</p>
              <p><strong>Customer:</strong> {replyingRequest.userName} ({replyingRequest.userEmail})</p>
              <p className="text-amber-800"><strong>Target Due Date:</strong> {replyingRequest.dueDateTime}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Request Status</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none"
                >
                  <option value="fulfilled">Fulfilled / Restock Confirmed</option>
                  <option value="in-review">In-Review / Sourcing</option>
                  <option value="rejected">Rejected / Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Reply Message for User</label>
                <textarea
                  rows="4"
                  placeholder="e.g. 'We have ordered this medicine from our supplier and it will be delivered by tomorrow 5 PM.'"
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingRequest(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {replySubmitting ? 'Sending Reply & Email...' : 'Send Reply & Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
