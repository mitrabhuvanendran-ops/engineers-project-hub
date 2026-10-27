/**
 * Real-time Request Logger for Health Check and Diagnostics
 */
class RequestLogger {
  constructor() {
    this.logs = [];
    this.listeners = new Set();
  }

  log({ method, url, status, durationMs, source = 'API', error = null }) {
    const entry = {
      id: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      method: method.toUpperCase(),
      url,
      status: status || (error ? 500 : 200),
      durationMs: Math.round(durationMs),
      source,
      error: error ? (error.message || String(error)) : null,
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(entry);
    if (this.logs.length > 50) {
      this.logs.pop();
    }

    this.listeners.forEach(fn => fn(entry, this.logs));
    return entry;
  }

  getLogs() {
    return [...this.logs];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(fn => fn(null, this.logs));
  }
}

export const requestLogger = new RequestLogger();

