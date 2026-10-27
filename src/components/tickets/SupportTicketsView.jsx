import React, { useState, useEffect } from 'react';
import { Ticket, Plus, RefreshCw, CheckCircle2, Clock, AlertTriangle, Database } from 'lucide-react';
import { getSupportTickets, submitSupportTicket, getErrorCodes } from '../../lib/faqErrorService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export function SupportTicketsView({ onAskAssistant }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCodes, setErrorCodes] = useState([]);

  // New ticket modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [errorCode, setErrorCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    const [tList, errList] = await Promise.all([
      getSupportTickets(user?.id),
      getErrorCodes()
    ]);
    setTickets(tList || []);
    setErrorCodes(errList.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !userEmail.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    const res = await submitSupportTicket({
      userEmail,
      subject,
      description,
      errorCode: errorCode ? parseInt(errorCode, 10) : null,
      userId: user?.id || null
    });

    setSubmitting(false);

    if (res?.success) {
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      setErrorCode('');
      loadTickets();
    } else {
      setErrorMsg('Failed to save ticket. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-2xl text-white shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-2">
            <Database className="w-4 h-4" />
            <span>Support System • Permanently Stored in SQL Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
            Support Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Submit bug reports, request technical assistance, or report error codes. All tickets are persisted directly in our PostgreSQL SQL table.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading support tickets from SQL database...</span>
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    #{String(t.id).slice(0, 12)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                  {t.error_code && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-50 text-red-700 border border-red-200">
                      Error {t.error_code}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                  {t.subject}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-3">
                  {t.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                  <span>Contact: {t.user_email}</span>
                  <span>•</span>
                  <span>Submitted: {formatDate(t.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Ticket className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm mb-1">No Support Tickets Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            If you experience an issue or have an unanswered question, create a ticket and it will be stored in our SQL database.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Ticket</span>
          </button>
        </div>
      )}

      {/* Ticket Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Support Ticket (Stored in SQL)"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="engineer@domain.edu"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ticket Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Formula evaluation returns error on power operator"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Related Error Code (Optional)
              </label>
              <select
                value={errorCode}
                onChange={(e) => setErrorCode(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">None / Not an error code</option>
                {errorCodes.map((ec) => (
                  <option key={ec.code} value={ec.code}>
                    {ec.code} - {ec.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, steps to reproduce, or what assistance is needed..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Submit to SQL Database</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
