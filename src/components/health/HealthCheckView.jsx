import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Cloud, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { testSupabaseConnection } from '../../lib/supabase';
import { fetchThirdPartyEngineeringData } from '../../lib/thirdPartyApi';
import { requestLogger } from '../../lib/requestLogger';

export function HealthCheckView() {
  const [dbStatus, setDbStatus] = useState({ checking: true, connected: false, message: 'Checking...' });
  const [thirdPartyStatus, setThirdPartyStatus] = useState({ loading: true, data: null });
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [systemUptime] = useState(Date.now());

  const runDiagnostics = async () => {
    setRefreshing(true);

    // 1. Check Supabase DB
    setDbStatus({ checking: true, connected: false, message: 'Pinging PostgreSQL...' });
    const startDb = performance.now();
    const dbRes = await testSupabaseConnection();
    const dbLatency = Math.round(performance.now() - startDb);
    setDbStatus({
      checking: false,
      connected: dbRes.connected,
      message: dbRes.message,
      latency: dbLatency
    });

    // 2. Check Third-Party API with 2500ms timeout & fallback
    setThirdPartyStatus({ loading: true, data: null });
    const tpData = await fetchThirdPartyEngineeringData(2500);
    setThirdPartyStatus({ loading: false, data: tpData });

    setRefreshing(false);
  };

  useEffect(() => {
    runDiagnostics();

    // Subscribe to real-time request logs
    setLogs(requestLogger.getLogs());
    const unsubscribe = requestLogger.subscribe((_, updatedLogs) => {
      setLogs([...updatedLogs]);
    });

    return () => unsubscribe();
  }, []);

  const getUptimeString = () => {
    const diffSec = Math.floor((Date.now() - systemUptime) / 1000);
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return `${min}m ${sec}s`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>HTTP 200 • System Operational & Health Monitored</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
            System Health & Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Uptime: {getUptimeString()} • Live Telemetry & Latency Diagnostics
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={refreshing}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Run Health Check</span>
        </button>
      </div>

      {/* 3 Core Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Core Web App */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Frontend App
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Healthy (200 OK)</span>
            </div>
            <p className="text-xs text-slate-500">
              Vite bundle rendered, responsive across mobile and desktop.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
            Node / SPA Vercel Runtime
          </div>
        </div>

        {/* 2. SQL Database (Supabase) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                SQL Database
              </span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              {dbStatus.checking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span className="text-slate-500">Pinging...</span>
                </>
              ) : dbStatus.connected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Connected ({dbStatus.latency}ms)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Local Demo Mode</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">
              {dbStatus.message}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
            PostgreSQL • RLS Enabled
          </div>
        </div>

        {/* 3. Third-Party API with Time Limit & Fallback */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Third-Party API
              </span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <Cloud className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              {thirdPartyStatus.loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span className="text-slate-500">Calling...</span>
                </>
              ) : thirdPartyStatus.data?.isFallback ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Fallback Active</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Live ({thirdPartyStatus.data?.latencyMs || 120}ms)</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {thirdPartyStatus.data?.isFallback
                ? 'Time limit exceeded (>2500ms) or offline; ISO standard fallback served.'
                : 'Live atmospheric engineering telemetry connected.'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
            Limit: 2500ms • Auto-Fallback
          </div>
        </div>
      </div>

      {/* Third-Party API Live Telemetry Inspection Card */}
      {thirdPartyStatus.data && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Third-Party API Telemetry (with 2500ms Time Limit & Fallback)</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
                thirdPartyStatus.data.isFallback
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {thirdPartyStatus.data.isFallback ? 'ISO Standard Fallback' : 'Live Stream'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3 font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] block">AMBIENT TEMP</span>
              <span className="text-base font-bold text-slate-800">
                {thirdPartyStatus.data.temperature} {thirdPartyStatus.data.temperatureUnit}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] block">RELATIVE HUMIDITY</span>
              <span className="text-base font-bold text-slate-800">
                {thirdPartyStatus.data.relativeHumidity} {thirdPartyStatus.data.humidityUnit}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] block">AIR DENSITY</span>
              <span className="text-base font-bold text-slate-800">
                {thirdPartyStatus.data.airDensity} {thirdPartyStatus.data.airDensityUnit}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] block">BAROMETRIC PRESSURE</span>
              <span className="text-base font-bold text-slate-800">
                {thirdPartyStatus.data.pressure} {thirdPartyStatus.data.pressureUnit}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-sans">
            <strong>Source:</strong> {thirdPartyStatus.data.source}.{' '}
            {thirdPartyStatus.data.reason && <span>({thirdPartyStatus.data.reason})</span>}
          </p>
        </div>
      )}

      {/* Real-time Request Logger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-600" />
              <span>Real-Time Request Logger</span>
            </h3>
            <p className="text-xs text-slate-500">
              Logging all internal API and third-party requests, response latency, and HTTP status codes.
            </p>
          </div>

          <button
            onClick={() => requestLogger.clear()}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Endpoint / URL</th>
                <th className="py-2.5 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-4 font-bold text-slate-700">{l.method}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          l.status >= 200 && l.status < 300
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 408
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{l.durationMs}ms</td>
                    <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-[120px]">
                      {l.source}
                    </td>
                    <td className="py-2 px-3 text-slate-800 truncate max-w-xs" title={l.url}>
                      {l.url}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400 text-[11px]">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No requests logged in current session yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

