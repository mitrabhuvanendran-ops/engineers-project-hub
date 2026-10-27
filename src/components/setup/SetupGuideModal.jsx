import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { testSupabaseConnection, isSupabaseConfigured } from '../../lib/supabase';
import { 
  Database, 
  Copy, 
  Check, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export function SetupGuideModal({ isOpen, onClose }) {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const sampleEnvText = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (err) {
      setTestResult({
        connected: false,
        message: err.message || 'Failed to connect'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(sampleEnvText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCopySqlFile = async () => {
    try {
      const response = await fetch('/supabase_schema.sql');
      const text = await response.text();
      navigator.clipboard.writeText(text);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch (err) {
      // Fallback
      navigator.clipboard.writeText('-- Run the supabase_schema.sql file located in the root of the project in your Supabase SQL editor.');
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Database & Storage Setup Guide"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-slate-700 text-xs sm:text-sm">
        {/* Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            isSupabaseConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {isSupabaseConfigured ? 'Supabase Credentials Detected' : 'Local Demo Mode Active'}
              </h4>
              <p className="text-xs mt-0.5 opacity-90">
                {isSupabaseConfigured
                  ? 'App is configured to read from your Supabase PostgreSQL database and Storage.'
                  : 'You can test every feature immediately using local storage. Follow the steps below to connect your real database.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              testResult.connected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {testResult.connected ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-mono">1</span>
              <span>Create a Supabase Project</span>
            </h5>
            <p className="text-xs text-slate-600 mb-2">
              Sign up or log in at{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline inline-flex items-center gap-0.5"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and create a new free project.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-mono">2</span>
                <span>Run the SQL Database Script</span>
              </h5>
              <button
                onClick={handleCopySqlFile}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>Copy SQL Script</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              Go to <strong>SQL Editor</strong> in your Supabase dashboard, paste the contents of{' '}
              <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px] font-mono">supabase_schema.sql</code>,
              and click <strong>Run</strong>. This creates all tables and Row-Level-Security (RLS) policies.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-mono">3</span>
                <span>Configure Environment Variables</span>
              </h5>
              <button
                onClick={handleCopyEnv}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
              >
                {copiedEnv ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>Copy .env Template</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              Create a <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px] font-mono">.env</code> file in your project directory:
            </p>
            <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
              {sampleEnvText}
            </pre>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-mono">4</span>
              <span>Storage Bucket ("project-files")</span>
            </h5>
            <p className="text-xs text-slate-600">
              The SQL script automatically creates a public storage bucket named{' '}
              <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px] font-mono">project-files</code>{' '}
              with RLS policies allowing authenticated users to upload and download drawings, photos, and files.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </Modal>
  );
}

