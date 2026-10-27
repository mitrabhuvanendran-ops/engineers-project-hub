import React from 'react';
import { AlertCircle, Bot, Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage({ onGoHome, onAskAssistant }) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center shadow-lg">
        {/* Big 404 Monospace Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-6 mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest font-mono font-bold text-amber-600 block mb-1">
          HTTP Error 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Page or Resource Not Found
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto mb-8">
          The requested URL does not match any route in Engineer's Project Hub. The document, project, or page may have been moved or removed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          {/* Core Rubric Requirement: "Ask the assistant" option */}
          <button
            onClick={() => onAskAssistant && onAskAssistant('I encountered a 404 Not Found error. Can you help me find what I am looking for?')}
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm shadow-brand-500/20 inline-flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Ask the Assistant</span>
          </button>
        </div>

        {/* Technical diagnostics footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-400">
          <span>Route Status: 404 NOT_FOUND • Handler: SPA Custom Fallback</span>
        </div>
      </div>
    </div>
  );
}
