import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts', true);
export const TrendRTT = new Trend('RTT');
export const RateContentOK = new Rate('ContentOK');
export const CounterErrors = new Counter('Errors');

export const options = {
  thresholds: {
    Errors: ['count<100'],
    ContentOK: ['rate>0.95'],
    RTT: ['p(99)<300', 'p(70)<250', 'avg<200', 'med<150', 'min<100'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['avg<10000']
  },
  scenarios: {
    contacts: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '15s', target: 15 },
        { duration: '15s', target: 15 },
        { duration: '15s', target: 15 },
        { duration: '15s', target: 30 },
        { duration: '15s', target: 30 },
        { duration: '15s', target: 30 },
        { duration: '15s', target: 60 },
        { duration: '15s', target: 60 },
        { duration: '15s', target: 60 },
        { duration: '15s', target: 120 },
        { duration: '15s', target: 120 },
        { duration: '15s', target: 120 },
        { duration: '15s', target: 180 },
        { duration: '15s', target: 180 },
        { duration: '15s', target: 180 },
        { duration: '15s', target: 240 },
        { duration: '15s', target: 240 },
        { duration: '15s', target: 240 },
        { duration: '15s', target: 300 },
        { duration: '15s', target: 300 }
      ]
    }
  }
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://api.chucknorris.io/jokes/random';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getContactsDuration.add(res.timings.duration);
  TrendRTT.add(res.timings.duration);
  RateContentOK.add(OK);
  CounterErrors.add(!OK);

  check(res, {
    'get contacts - status 200': () => res.status === OK
  });
}
