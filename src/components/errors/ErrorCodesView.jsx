import React, { useState, useEffect } from 'react';
import { getErrorCodes } from '../../lib/faqErrorService';
import { AlertTriangle, Search, Bot, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export function ErrorCodesView({ onAskAssistant }) {
  const [errorCodes, setErrorCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getErrorCodes();
      setErrorCodes(res.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredErrors = errorCodes.filter((err) => {
    const q = search.toLowerCase();
    return (
      String(err.code).includes(q) ||
      err.name.toLowerCase().includes(q) ||
      err.description.toLowerCase().includes(q) ||
      err.cause.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 sm:p-8 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-mono mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Error Code Directory • Minimum 8 Codes Stored in SQL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          HTTP & Engineering Error Codes
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Quick troubleshooting guide for all system and application error codes. Includes standard HTTP status codes and our custom site-specific calculation code <strong>480 (ERR_CALC_SYNTAX)</strong>.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search error codes by number (e.g. 403, 404, 480) or description..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid of Error Codes */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading error codes from SQL database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredErrors.map((err) => {
            const isSiteSpecific = err.is_site_specific || err.code === 480;

            return (
              <div
                key={err.code}
                className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all bg-white ${
                  isSiteSpecific
                    ? 'border-purple-300 ring-1 ring-purple-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top code badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-mono font-bold px-2.5 py-1 rounded-lg ${
                          isSiteSpecific
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : err.code >= 500
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {err.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {err.name}
                      </h3>
                    </div>

                    {isSiteSpecific && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        <span>Site-Specific</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {err.description}
                  </p>

                  {/* Cause & Solution Box */}
                  <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-2 border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                        Common Cause:
                      </span>
                      <p className="text-slate-600 mt-0.5">{err.cause}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                        Recommended Solution:
                      </span>
                      <p className="text-emerald-700 font-medium mt-0.5 flex items-start gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-600" />
                        <span>{err.solution}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 mt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => onAskAssistant && onAskAssistant(`Can you explain error code ${err.code} (${err.name}) and how to solve it?`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-brand-600" />
                    <span>Ask Assistant about {err.code}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

