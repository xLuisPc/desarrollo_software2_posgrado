import express from 'express';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  cities,
  countries,
  normalizeUniversities,
  summarizeForecast,
  demoWeather,
} from './domain.mjs';
const snapshot = JSON.parse(
  readFileSync(new URL('./data/universities.json', import.meta.url), 'utf8'),
);

// La inyección de fetch permite probar los errores de APIs sin Internet ni una clave real.
export function createApp({
  fetcher = fetch,
  apiKey = process.env.OPENWEATHER_API_KEY || '',
  demo = process.env.DEMO_MODE === 'true',
  universitiesDemo = process.env.UNIVERSITIES_DEMO === 'true',
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  const universityCache = new Map();
  const weatherCache = new Map();
  const weatherDemo = demo || !apiKey.trim();
  app.get('/api/config', (_req, res) =>
    res.json({ weatherDemo, universitiesDemo, countries, cities }),
  );
  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', weatherMode: weatherDemo ? 'demo' : 'live' }),
  );
  async function upstream(url) {
    const response = await fetcher(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      const error = new Error('Upstream error');
      error.status = response.status;
      throw error;
    }
    return response.json();
  }
  app.get('/api/universities', async (req, res) => {
    const country = typeof req.query.country === 'string' ? req.query.country : 'Colombia';
    if (!countries.some((c) => c.name === country))
      return res.status(400).json({ message: 'Selecciona uno de los países disponibles.' });
    const cached = universityCache.get(country);
    if (cached && cached.expires > Date.now()) return res.json(cached.value);
    let rows;
    let source = 'live';
    let message = '';
    if (universitiesDemo) {
      rows = snapshot.filter((u) => u.country === country);
      source = 'snapshot';
      message = 'Catálogo de respaldo · modo de ensayo activado.';
    } else {
      try {
        const url = new URL('http://universities.hipolabs.com/search');
        url.searchParams.set('country', country);
        rows = await upstream(url);
        if (!Array.isArray(rows)) throw new Error('Formato inesperado');
      } catch {
        rows = snapshot.filter((u) => u.country === country);
        source = 'snapshot';
        message =
          'Universities API no está disponible. Mostramos la copia del catálogo de Hipo del 12 sep. 2026.';
      }
    }
    const value = {
      items: normalizeUniversities(rows),
      source,
      message,
      snapshotDate: source === 'snapshot' ? '2026-09-12' : null,
    };
    universityCache.set(country, {
      value,
      expires: Date.now() + (source === 'live' ? 600_000 : 30_000),
    });
    return res.json(value);
  });
  app.get('/api/weather', async (req, res) => {
    const city = cities.find((c) => c.id === req.query.city);
    if (!city)
      return res
        .status(400)
        .json({ message: 'Selecciona una ciudad válida para consultar su clima.' });
    if (weatherDemo) return res.json(demoWeather(city));
    const cached = weatherCache.get(city.id);
    if (cached && cached.expires > Date.now()) return res.json(cached.value);
    try {
      const params = new URLSearchParams({
        lat: String(city.lat),
        lon: String(city.lon),
        appid: apiKey.trim(),
        units: 'metric',
        lang: 'es',
      });
      const [current, forecast] = await Promise.all([
        upstream(`https://api.openweathermap.org/data/2.5/weather?${params}`),
        upstream(`https://api.openweathermap.org/data/2.5/forecast?${params}`),
      ]);
      if (
        !current.main ||
        !current.weather?.length ||
        !forecast.city ||
        !Array.isArray(forecast.list)
      )
        throw new Error('Respuesta incompleta');
      const value = {
        source: 'live',
        city,
        observedAt: new Date(current.dt * 1000).toISOString(),
        current: {
          temp: Math.round(current.main.temp),
          feelsLike: Math.round(current.main.feels_like),
          humidity: current.main.humidity,
          wind: current.wind.speed,
          description: current.weather[0].description,
          icon: current.weather[0].icon,
        },
        forecast: summarizeForecast(forecast),
      };
      weatherCache.set(city.id, { value, expires: Date.now() + 600_000 });
      return res.json(value);
    } catch (error) {
      const status = error.status === 401 ? 401 : error.status === 429 ? 429 : 502;
      const message =
        status === 401
          ? 'OpenWeather rechazó la clave. Revisa OPENWEATHER_API_KEY y espera su activación; después reinicia el servidor.'
          : status === 429
            ? 'Se alcanzó el límite de OpenWeather. Espera unos minutos e inténtalo otra vez.'
            : 'No pudimos consultar OpenWeather. Revisa la conexión e inténtalo otra vez.';
      return res.status(status).json({ message });
    }
  });
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Servicio no encontrado.' }));
  const dist = fileURLToPath(new URL('../dist/campus-norte/browser/', import.meta.url));
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/{*path}', (_req, res) => res.sendFile(`${dist}/index.html`));
  }
  return app;
}
