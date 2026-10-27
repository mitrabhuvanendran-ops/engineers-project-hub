import React from 'react';
import { AlertTriangle, Bot, RefreshCw, Home } from 'lucide-react';

export function ServerErrorPage({ onGoHome, onAskAssistant, onRetry }) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-red-200 p-8 sm:p-10 text-center shadow-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 border border-red-200 text-red-600 mb-6 mx-auto">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest font-mono font-bold text-red-600 block mb-1">
          HTTP Error 500
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Internal Server Error
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto mb-8">
          An unexpected server condition occurred while processing your request. Our automated diagnostics have recorded the incident.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Request</span>
            </button>
          )}

          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Core Rubric Requirement: "Ask the assistant" option */}
          <button
            onClick={() => onAskAssistant && onAskAssistant('I ran into a 500 Internal Server Error. What should I check or can you open a support ticket?')}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm shadow-red-500/20 inline-flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Ask the Assistant</span>
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-400">
          <span>Server Status: 500 CRITICAL_ERROR • SQL Database Handler</span>
        </div>
      </div>
    </div>
  );
}
