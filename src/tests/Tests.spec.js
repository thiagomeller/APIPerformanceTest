import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts', true);

export const TrendRTT = new Trend('RTT');
export const RateContentOK = new Rate('ContentOK');
export const GaugeContentSize = new Gauge('ContentSize');
export const CounterErrors = new Counter('Errors');

export const options = {
  thresholds: {
    Errors: ['count<100'],
    ContentSize: ['value<4000'],
    ContentOK: ['rate>0.95'],
    RTT: ['p(99)<300', 'p(70)<250', 'avg<200', 'med<150', 'min<100'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['avg<10000']
  },
  stages: [{ duration: '1m', target: 1000 }]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data)
    // stdout: textSummary(data, { indent: ' ', enableColors: true })
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
  console.log(res);

  getContactsDuration.add(res.timings.duration);
  TrendRTT.add(res.timings.duration);
  RateContentOK.add(OK);
  // GaugeContentSize.add(res.value.length);
  CounterErrors.add(!OK);

  check(res, {
    'get contacts - status 200': () => res.status === OK
  });
}
