import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.mjs';
async function withServer(options, run) {
  const server = createApp(options).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
const row = {
  name: 'Example University',
  country: 'Colombia',
  alpha_two_code: 'CO',
  domains: ['example.edu'],
  web_pages: ['https://example.edu'],
};
test('consume Hipolabs con país y reutiliza la caché', async () => {
  let calls = 0;
  await withServer(
    {
      fetcher: async (url) => {
        calls++;
        assert.equal(url.hostname, 'universities.hipolabs.com');
        assert.equal(url.searchParams.get('country'), 'Colombia');
        return Response.json([row]);
      },
    },
    async (base) => {
      const a = await (await fetch(base + '/api/universities?country=Colombia')).json();
      const b = await (await fetch(base + '/api/universities?country=Colombia')).json();
      assert.equal(a.source, 'live');
      assert.equal(a.items[0].name, row.name);
      assert.deepEqual(a, b);
      assert.equal(calls, 1);
    },
  );
});
test('un fallo en Hipolabs devuelve respaldo con procedencia explícita', async () => {
  await withServer(
    {
      fetcher: async () => {
        throw new Error('offline');
      },
    },
    async (base) => {
      const result = await (await fetch(base + '/api/universities?country=Colombia')).json();
      assert.equal(result.source, 'snapshot');
      assert.ok(result.items.length > 20);
      assert.match(result.message, /copia/);
    },
  );
});
test('valida ciudad y país antes de hacer peticiones externas', async () => {
  await withServer(
    {
      fetcher: () => {
        throw new Error('No debe llamarse');
      },
    },
    async (base) => {
      assert.equal((await fetch(base + '/api/weather?city=invalid')).status, 400);
      assert.equal((await fetch(base + '/api/universities?country=invalid')).status, 400);
    },
  );
});
test('sin clave usa demo, y config no expone claves', async () => {
  await withServer({ apiKey: '' }, async (base) => {
    const weather = await (await fetch(base + '/api/weather?city=bogota')).json();
    const config = await (await fetch(base + '/api/config')).json();
    assert.equal(weather.source, 'demo');
    assert.equal(config.weatherDemo, true);
    assert.equal('apiKey' in config, false);
  });
});
for (const status of [401, 429, 500])
  test(`error OpenWeather ${status} no se oculta con datos demo`, async () => {
    await withServer(
      { apiKey: 'test-key', fetcher: async () => new Response('{}', { status }) },
      async (base) => {
        const response = await fetch(base + '/api/weather?city=bogota');
        const body = await response.json();
        assert.equal(response.status, status === 500 ? 502 : status);
        assert.equal(body.source, undefined);
        assert.ok(body.message);
        assert.ok(!JSON.stringify(body).includes('test-key'));
      },
    );
  });
test('solicita clima y pronóstico con coordenadas, unidades e idioma, sin filtrar la clave', async () => {
  const calls = [];
  await withServer(
    {
      apiKey: 'test-key',
      fetcher: async (url) => {
        const u = new URL(url);
        calls.push(u);
        assert.equal(u.searchParams.get('units'), 'metric');
        assert.equal(u.searchParams.get('lang'), 'es');
        assert.equal(u.searchParams.get('appid'), 'test-key');
        assert.equal(u.searchParams.get('lat'), '4.711');
        return u.pathname.endsWith('/weather')
          ? Response.json({
              dt: Date.now() / 1000,
              main: { temp: 17.4, feels_like: 16, humidity: 70 },
              wind: { speed: 3 },
              weather: [{ description: 'nubes', icon: '04d' }],
            })
          : Response.json({ city: { timezone: -18000 }, list: [] });
      },
    },
    async (base) => {
      const result = await (await fetch(base + '/api/weather?city=bogota')).json();
      await fetch(base + '/api/weather?city=bogota');
      assert.equal(result.source, 'live');
      assert.equal(result.current.temp, 17);
      assert.equal(calls.length, 2);
      assert.ok(!JSON.stringify(result).includes('test-key'));
    },
  );
});
