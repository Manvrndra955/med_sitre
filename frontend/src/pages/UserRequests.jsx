import React, { useState, useEffect } from 'react';
import { FileQuestion, Clock, CheckCircle2, MessageSquare, Send, Calendar, AlertCircle } from 'lucide-react';
import { submitSpecialRequest, fetchUserRequests } from '../api';

export default function UserRequests({ initialMedicineName = '' }) {
  const [medicineName, setMedicineName] = useState(initialMedicineName);
  const [quantity, setQuantity] = useState(1);
  const [dueDateTime, setDueDateTime] = useState('');
  const [note, setNote] = useState('');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchUserRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicineName || !dueDateTime) {
      setError('Please provide the medicine name and required due date/time.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await submitSpecialRequest({
        medicineName,
        quantity: Number(quantity),
        dueDateTime,
        note
      });

      setMessage('Your request has been submitted to the Admin team! You will receive a response here soon.');
      setMedicineName('');
      setQuantity(1);
      setDueDateTime('');
      setNote('');
      loadRequests();
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-3xl p-8 shadow-xl flex items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full">
            Special Pharmacy Assistance
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold">Request Unavailable Medicine</h1>
          <p className="text-amber-100 text-sm max-w-xl">
            Can't find your required medicine in our catalog? Specify what you need and your target due date, and our pharmacy admin will source it for you.
          </p>
        </div>
        <div className="hidden sm:flex w-20 h-20 bg-white/10 rounded-2xl items-center justify-center shrink-0">
          <FileQuestion className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Form & Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Submit Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-600" /> Submit New Query
          </h3>

          {message && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name Required</label>
              <input
                type="text"
                placeholder="e.g. Lipitor 20mg or Paracetamol Syrup"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Needed</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Due Date & Time</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Tomorrow by 6:00 PM or Aug 25th"
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes / Prescription</label>
              <textarea
                rows="3"
                placeholder="Specify dosage strength, brand preference, or urgency note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting Request...' : 'Send Request To Admin'}
            </button>
          </form>
        </div>

        {/* Requests List */}
        <div className="md:col-span-3 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" /> Your Request History & Admin Replies
          </h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading your submitted requests...</div>
          ) : requests.length === 0 ? (
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
              No requests submitted yet. Use the form to request medicines!
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{req.medicineName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Qty: <strong>{req.quantity}</strong> • Required Due: <strong className="text-amber-700">{req.dueDateTime}</strong>
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status === 'pending' ? 'Pending Admin Reply' : req.status}
                    </span>
                  </div>

                  {req.note && (
                    <p className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600 italic">
                      "{req.note}"
                    </p>
                  )}

                  {/* Admin Reply Box */}
                  {req.adminReply ? (
                    <div className="bg-teal-50/80 p-4 rounded-xl border border-teal-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                        <MessageSquare className="w-4 h-4 text-teal-600" /> Admin Response:
                      </div>
                      <p className="text-xs text-teal-800 font-medium leading-relaxed">
                        {req.adminReply}
                      </p>
                      {req.repliedAt && (
                        <span className="block text-[10px] text-teal-600 font-semibold pt-1">
                          Replied on {new Date(req.repliedAt).toLocaleDateString()} at {new Date(req.repliedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      ⏳ Admin will review your request and reply shortly.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
