import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
export const cities = JSON.parse(
  readFileSync(new URL('./data/cities.json', import.meta.url), 'utf8'),
);
export const countries = [
  { name: 'Colombia', label: 'Colombia', code: 'CO' },
  { name: 'Spain', label: 'España', code: 'ES' },
  { name: 'Mexico', label: 'México', code: 'MX' },
  { name: 'Argentina', label: 'Argentina', code: 'AR' },
  { name: 'Chile', label: 'Chile', code: 'CL' },
  { name: 'Peru', label: 'Perú', code: 'PE' },
];
// Hipolabs no ofrece ciudades. Este catálogo editorial solo sugiere una sede.
const cityByDomain = {
  'unal.edu.co': 'bogota',
  'uniandes.edu.co': 'bogota',
  'javeriana.edu.co': 'bogota',
  'urosario.edu.co': 'bogota',
  'uexternado.edu.co': 'bogota',
  'udistrital.edu.co': 'bogota',
  'eafit.edu.co': 'medellin',
  'udea.edu.co': 'medellin',
  'upb.edu.co': 'medellin',
  'udem.edu.co': 'medellin',
  'univalle.edu.co': 'cali',
  'icesi.edu.co': 'cali',
  'uao.edu.co': 'cali',
  'unillanos.edu.co': 'villavicencio',
  'uninorte.edu.co': 'barranquilla',
  'uniatlantico.edu.co': 'barranquilla',
  'uis.edu.co': 'bucaramanga',
  'unab.edu.co': 'bucaramanga',
  'unicartagena.edu.co': 'cartagena',
  'ucaldas.edu.co': 'manizales',
  'utp.edu.co': 'pereira',
  'uptc.edu.co': 'tunja',
  'unicauca.edu.co': 'popayan',
  'udenar.edu.co': 'pasto',
  'ucm.es': 'madrid',
  'upm.es': 'madrid',
  'ub.edu': 'barcelona',
  'unam.mx': 'mexico',
  'uba.ar': 'buenos-aires',
  'uchile.cl': 'santiago',
  'unmsm.edu.pe': 'lima',
};
export const normalize = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export function safeWebsite(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export function normalizeUniversities(rows) {
  const unique = new Map();
  for (const row of rows) {
    if (
      typeof row.name !== 'string' ||
      typeof row.country !== 'string' ||
      !Array.isArray(row.domains)
    )
      continue;
    const domain = row.domains.find((d) => typeof d === 'string') || '';
    const id = createHash('sha256')
      .update(`${row.country}|${row.name}|${domain}`)
      .digest('hex')
      .slice(0, 16);
    const cityId = cityByDomain[domain];
    const city = cities.find((c) => c.id === cityId);
    unique.set(id, {
      id,
      name: row.name,
      country: row.country,
      countryLabel: countries.find((c) => c.name === row.country)?.label || row.country,
      code: row.alpha_two_code,
      domain,
      website: safeWebsite(row.web_pages?.[0]),
      state: row['state-province'] || null,
      city: city?.name || null,
      cityId: city?.id || null,
    });
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
// Convierte UTC a la fecha local de la ciudad (no a la del computador del visitante).
export function localDate(timestamp, offset) {
  return new Date((timestamp + offset) * 1000).toISOString().slice(0, 10);
}
export function summarizeForecast(payload, now = Date.now()) {
  const offset = payload.city.timezone || 0;
  const groups = new Map();
  for (const slot of payload.list) {
    if (slot.dt * 1000 < now) continue;
    const key = localDate(slot.dt, offset);
    const items = groups.get(key) || [];
    items.push(slot);
    groups.set(key, items);
  }
  return [...groups.entries()].slice(0, 5).map(([date, slots]) => {
    const noon = [...slots].sort(
      (a, b) =>
        Math.abs(((a.dt + offset) % 86400) - 43200) - Math.abs(((b.dt + offset) % 86400) - 43200),
    )[0];
    return {
      date,
      min: Math.round(Math.min(...slots.map((s) => s.main.temp_min))),
      max: Math.round(Math.max(...slots.map((s) => s.main.temp_max))),
      rain: Math.round(Math.max(...slots.map((s) => s.pop || 0)) * 100),
      description: noon.weather[0].description,
      icon: noon.weather[0].icon,
      slots: slots.length,
    };
  });
}
export function demoWeather(city) {
  const warm = ['villavicencio', 'cali', 'barranquilla', 'cartagena'].includes(city.id);
  const temp = warm ? 28 : city.id === 'medellin' ? 24 : 18;
  const forecast = [0, 1, 2, 3, 4].map((i) => ({
    date: new Date(Date.UTC(2026, 8, 14 + i)).toISOString().slice(0, 10),
    min: temp - 5 + (i % 2),
    max: temp + (i % 3),
    rain: [20, 65, 15, 10, 40][i],
    description: ['algo de nubes', 'lluvia ligera', 'cielo claro', 'cielo claro', 'nubes'][i],
    icon: ['02d', '10d', '01d', '01d', '04d'][i],
    slots: 8,
  }));
  return {
    source: 'demo',
    city,
    observedAt: null,
    current: {
      temp,
      feelsLike: temp - 1,
      humidity: 68,
      wind: 2.8,
      description: 'algo de nubes',
      icon: '02d',
    },
    forecast,
  };
}
