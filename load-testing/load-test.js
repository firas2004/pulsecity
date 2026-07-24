/**
 * PulseCity — Test de charge k6
 * ===============================
 * Simule 50 utilisateurs virtuels (VU) appelant l'endpoint /anomalies
 * pendant 2 minutes avec montée progressive et seuils de performance.
 *
 * Usage :
 *   k6 run load-testing/load-test.js
 *   k6 run --out json=results.json load-testing/load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Métriques custom ─────────────────────────────────────────────────────────
const anomalyCount    = new Counter('pulsecity_anomalies_returned');
const errorRate       = new Rate('pulsecity_error_rate');
const responseTrend   = new Trend('pulsecity_response_time_ms', true);
const healthCheckRate = new Rate('pulsecity_health_ok');

// ── Configuration ─────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  // Profil de charge : montée progressive → plateau → descente
  stages: [
    { duration: '30s',  target: 10  }, // Montée douce : 0 → 10 VU
    { duration: '30s',  target: 50  }, // Montée : 10 → 50 VU
    { duration: '60s',  target: 50  }, // Plateau : 50 VU pendant 1 minute
    { duration: '20s',  target: 20  }, // Descente : 50 → 20 VU
    { duration: '10s',  target: 0   }, // Arrêt : 20 → 0 VU
  ],

  // ── Seuils de performance acceptables ──────────────────────────────────────
  thresholds: {
    // Temps de réponse
    'http_req_duration': [
      'p(50) < 100',   // Médiane < 100ms
      'p(95) < 500',   // P95 < 500ms (SLA principal)
      'p(99) < 1000',  // P99 < 1 seconde
    ],
    // Taux d'erreurs HTTP
    'http_req_failed': ['rate < 0.01'],  // Moins de 1% d'erreurs

    // Métriques custom
    'pulsecity_error_rate': ['rate < 0.01'],
    'pulsecity_health_ok':  ['rate > 0.99'],
  },
};

// ── Scénario principal ────────────────────────────────────────────────────────
export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // ── Test 1 : /anomalies (endpoint principal) ──────────────────────────────
  const anomaliesRes = http.get(`${BASE_URL}/anomalies?limit=20`, { headers, tags: { endpoint: 'anomalies' } });

  const anomaliesOk = check(anomaliesRes, {
    'GET /anomalies — status 200':    (r) => r.status === 200,
    'GET /anomalies — body non vide': (r) => r.body.length > 0,
    'GET /anomalies — has count key': (r) => {
      try { return JSON.parse(r.body).count !== undefined; }
      catch { return false; }
    },
    'GET /anomalies — latence < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!anomaliesOk);
  responseTrend.add(anomaliesRes.timings.duration);

  if (anomaliesOk && anomaliesRes.status === 200) {
    try {
      const body = JSON.parse(anomaliesRes.body);
      anomalyCount.add(body.count || 0);
    } catch {}
  }

  sleep(0.5); // Pause 500ms entre les requêtes (réaliste)

  // ── Test 2 : /health (vérification santé) ────────────────────────────────
  const healthRes = http.get(`${BASE_URL}/health`, { headers, tags: { endpoint: 'health' } });

  const healthOk = check(healthRes, {
    'GET /health — status 200':       (r) => r.status === 200,
    'GET /health — status is "ok"':   (r) => {
      try { return JSON.parse(r.body).status === 'ok'; }
      catch { return false; }
    },
  });

  healthCheckRate.add(healthOk);

  sleep(0.5);

  // ── Test 3 : /anomalies avec limit variable ───────────────────────────────
  const limit = Math.floor(Math.random() * 50) + 1; // Limite aléatoire 1-50
  const limitedRes = http.get(`${BASE_URL}/anomalies?limit=${limit}`, {
    headers,
    tags: { endpoint: 'anomalies_limited' }
  });

  check(limitedRes, {
    'GET /anomalies?limit=N — status 200':     (r) => r.status === 200,
    'GET /anomalies?limit=N — count <= limit': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.count <= limit;
      } catch { return false; }
    },
  });

  sleep(1); // Pause 1s avant le prochain cycle VU
}

// ── Rapport de fin de test ────────────────────────────────────────────────────
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  return {
    // Rapport JSON brut
    [`results/k6-report-${timestamp}.json`]: JSON.stringify(data, null, 2),
    // Résumé console formaté
    stdout: formatSummary(data),
  };
}

function formatSummary(data) {
  const metrics = data.metrics;
  const duration = metrics.http_req_duration?.values;

  const p50  = duration?.['p(50)']  ? `${duration['p(50)'].toFixed(1)} ms` : 'N/A';
  const p95  = duration?.['p(95)']  ? `${duration['p(95)'].toFixed(1)} ms` : 'N/A';
  const p99  = duration?.['p(99)']  ? `${duration['p(99)'].toFixed(1)} ms` : 'N/A';
  const rps  = metrics.http_reqs?.values?.rate ? `${metrics.http_reqs.values.rate.toFixed(2)} req/s` : 'N/A';
  const err  = metrics.http_req_failed?.values?.rate
    ? `${(metrics.http_req_failed.values.rate * 100).toFixed(2)} %`
    : 'N/A';

  return `
╔══════════════════════════════════════════════════════════════╗
║         PulseCity — Rapport de Test de Charge k6             ║
╠══════════════════════════════════════════════════════════════╣
║  VU max       : 50                                           ║
║  Durée totale : ~2 minutes                                   ║
╠══════════════════════════════════════════════════════════════╣
║  Latence P50  : ${p50.padEnd(43)}║
║  Latence P95  : ${p95.padEnd(43)}║
║  Latence P99  : ${p99.padEnd(43)}║
║  Débit        : ${rps.padEnd(43)}║
║  Taux erreurs : ${err.padEnd(43)}║
╚══════════════════════════════════════════════════════════════╝
`;
}
