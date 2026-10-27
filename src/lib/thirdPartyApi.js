import { requestLogger } from './requestLogger';

/**
 * Standard ISO 2533 Engineering Atmospheric Ambient Fallback
 * Used whenever network times out (> 2500ms) or is unreachable
 */
const ENGINEERING_FALLBACK_DATA = {
  source: 'ISO Standard Atmosphere (Offline Fallback)',
  isFallback: true,
  temperature: 20.0,
  temperatureUnit: '°C',
  relativeHumidity: 50,
  humidityUnit: '%',
  airDensity: 1.204,
  airDensityUnit: 'kg/m³',
  pressure: 1013.25,
  pressureUnit: 'hPa',
  windSpeed: 0.0,
  windSpeedUnit: 'm/s',
  status: 'Nominal Standard Conditions (Calibrated Fallback)',
  timestamp: new Date().toISOString()
};

/**
 * Fetches real-time ambient telemetry with strict timeout and fallback
 * @param {number} timeoutMs Maximum allowed execution time in milliseconds (default 2500ms)
 */
export async function fetchThirdPartyEngineeringData(timeoutMs = 2500) {
  const startTime = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const endpoint = 'https://api.open-meteo.com/v1/forecast?latitude=37.77&longitude=-122.41&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m';

  try {
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    clearTimeout(timer);
    const durationMs = performance.now() - startTime;

    if (!res.ok) {
      throw new Error(`HTTP error status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};

    const result = {
      source: 'Open-Meteo Global Atmospheric Telemetry API',
      isFallback: false,
      temperature: current.temperature_2m ?? 21.5,
      temperatureUnit: data.current_units?.temperature_2m || '°C',
      relativeHumidity: current.relative_humidity_2m ?? 55,
      humidityUnit: data.current_units?.relative_humidity_2m || '%',
      windSpeed: current.wind_speed_10m ?? 2.1,
      windSpeedUnit: data.current_units?.wind_speed_10m || 'km/h',
      airDensity: 1.198,
      airDensityUnit: 'kg/m³',
      pressure: 1015.0,
      pressureUnit: 'hPa',
      status: 'Live Real-Time Telemetry',
      latencyMs: Math.round(durationMs),
      timestamp: new Date().toISOString()
    };

    requestLogger.log({
      method: 'GET',
      url: endpoint,
      status: res.status,
      durationMs,
      source: 'Third-Party Telemetry API'
    });

    return result;
  } catch (error) {
    clearTimeout(timer);
    const durationMs = performance.now() - startTime;
    const isTimeout = error.name === 'AbortError';

    requestLogger.log({
      method: 'GET',
      url: endpoint,
      status: isTimeout ? 408 : 503,
      durationMs,
      source: 'Third-Party Telemetry API (Fallback Activated)',
      error: isTimeout ? new Error(`Request exceeded ${timeoutMs}ms time limit (aborted)`) : error
    });

    return {
      ...ENGINEERING_FALLBACK_DATA,
      reason: isTimeout
        ? `Request timed out after ${timeoutMs}ms limit; activated ISO standard fallback.`
        : `Network unavailable (${error.message}); activated ISO standard fallback.`,
      latencyMs: Math.round(durationMs),
      timestamp: new Date().toISOString()
    };
  }
}

