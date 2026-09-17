import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUniversities,
  safeWebsite,
  localDate,
  summarizeForecast,
  demoWeather,
  cities,
} from '../server/domain.mjs';
const row = {
  name: 'Universidad de Los Llanos',
  country: 'Colombia',
  alpha_two_code: 'CO',
  domains: ['unillanos.edu.co'],
  web_pages: ['https://www.unillanos.edu.co'],
  'state-province': null,
};
test('normaliza, elimina duplicados y conserva un ID estable', () => {
  const [u] = normalizeUniversities([row, row]);
  assert.equal(normalizeUniversities([row, row]).length, 1);
  assert.equal(u.id, normalizeUniversities([row])[0].id);
  assert.equal(u.cityId, 'villavicencio');
  assert.equal(u.state, null);
});
test('no inventa la ubicación de universidades desconocidas', () => {
  const [u] = normalizeUniversities([{ ...row, domains: ['unknown.edu'] }]);
  assert.equal(u.city, null);
  assert.equal(u.cityId, null);
});
test('descarta registros inválidos y bloquea URLs ejecutables', () => {
  assert.equal(normalizeUniversities([{}, row]).length, 1);
  assert.equal(safeWebsite('javascript:alert(1)'), null);
  assert.equal(safeWebsite('data:text/html,bad'), null);
  assert.equal(safeWebsite('https://example.org'), 'https://example.org/');
});
test('agrupa por fecha de la ciudad y no por UTC', () => {
  const timestamp = Date.parse('2026-09-15T02:00:00Z') / 1000;
  assert.equal(localDate(timestamp, -18000), '2026-09-14');
});
test('el pronóstico usa mínimos, máximos y la mayor probabilidad de los intervalos', () => {
  const slot = (date, min, max, pop) => ({
    dt: Date.parse(date) / 1000,
    main: { temp_min: min, temp_max: max },
    pop,
    weather: [{ description: 'nubes', icon: '04d' }],
  });
  const result = summarizeForecast(
    {
      city: { timezone: -18000 },
      list: [
        slot('2026-09-14T15:00:00Z', 12.2, 22.6, 0.2),
        slot('2026-09-14T18:00:00Z', 15, 24, 0.7),
        slot('2026-09-15T03:00:00Z', 10, 17, 0.4),
        slot('2026-09-15T15:00:00Z', 11, 23, 0.1),
      ],
    },
    Date.parse('2026-09-14T00:00:00Z'),
  );
  assert.equal(result.length, 2);
  assert.deepEqual(
    { min: result[0].min, max: result[0].max, rain: result[0].rain, slots: result[0].slots },
    { min: 10, max: 24, rain: 70, slots: 3 },
  );
});
test('excluye intervalos pasados y limita a cinco fechas', () => {
  const list = Array.from({ length: 8 }, (_, i) => ({
    dt: Date.parse(`2026-09-${12 + i}T12:00:00Z`) / 1000,
    main: { temp_min: 10, temp_max: 20 },
    pop: 0,
    weather: [{ description: 'sol', icon: '01d' }],
  }));
  const result = summarizeForecast(
    { city: { timezone: 0 }, list },
    Date.parse('2026-09-13T15:00:00Z'),
  );
  assert.equal(result.length, 5);
  assert.equal(result[0].date, '2026-09-14');
});
test('el clima de muestra está identificado y no declara una observación real', () => {
  const weather = demoWeather(cities[0]);
  assert.equal(weather.source, 'demo');
  assert.equal(weather.observedAt, null);
  assert.equal(weather.forecast.length, 5);
});
