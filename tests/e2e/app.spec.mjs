import { test, expect } from '@playwright/test';
test('explora, busca sin tildes y consulta una universidad', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Explora universidades', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Clima de demostración', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar universidad' }).fill('llanos');
  await expect(page.locator('app-university-card')).toHaveCount(1);
  await page
    .locator('app-university-card')
    .getByRole('link', { name: 'Explorar', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Universidad de Los Llanos', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Ciudad de visita')).toHaveValue('villavicencio');
  await page.getByLabel('Confirmar la sede y el horario de atención').check();
  await expect(page.getByLabel('Confirmar la sede y el horario de atención')).toBeChecked();
  expect(errors).toEqual([]);
});
test('guarda favoritos y persiste al recargar', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('app-university-card').first();
  await card.getByRole('button', { name: /Guardar:/ }).click();
  await page.getByRole('link', { name: /Mis universidades/ }).click();
  await expect(page.locator('app-university-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('app-university-card')).toHaveCount(1);
  await page.getByRole('button', { name: /Quitar de favoritos:/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Tu próximo destino merece un favorito.' }),
  ).toBeVisible();
});
test('limita la comparación a tres opciones y exporta CSV', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-university-card')).toHaveCount(8);
  for (let i = 0; i < 4; i++)
    await page
      .locator('app-university-card')
      .nth(i)
      .getByRole('button', { name: 'Comparar', exact: true })
      .click();
  await expect(page.getByRole('status')).toContainText('hasta 3');
  await page.getByRole('link', { name: /^Comparar/ }).click();
  await expect(page.locator('thead th')).toHaveCount(4);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar comparación' }).click();
  expect((await download).suggestedFilename()).toBe('campus-norte-comparacion.csv');
  await page
    .getByRole('button', { name: /Quitar de comparación:/ })
    .first()
    .click();
  await expect(page.locator('thead th')).toHaveCount(3);
});
test('cambia país, filtra ciudades, pagina y muestra estado vacío', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.getByText(/Página 2 de/)).toBeVisible();
  await page.getByRole('combobox', { name: 'País', exact: true }).selectOption('Spain');
  await expect(page.getByLabel('Ciudad de visita')).toHaveValue('madrid');
  await page.getByRole('button', { name: 'Madrid', exact: true }).click();
  await expect(page.locator('app-university-card').first()).toContainText('Madrid');
  await page.getByRole('textbox', { name: 'Buscar universidad' }).fill('zzzznoexiste');
  await expect(page.getByRole('heading', { name: 'Aún hay mucho por descubrir' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.locator('app-university-card').first()).toBeVisible();
});
test('muestra error real de clima y permite reintentar', async ({ page }) => {
  await page.route('**/api/weather?**', (route) =>
    route.fulfill({ status: 401, json: { message: 'OpenWeather rechazó la clave.' } }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('rechazó la clave');
  await expect(page.getByText('Clima de demostración', { exact: true })).toHaveCount(0);
  await page.unroute('**/api/weather?**');
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByText('Clima de demostración', { exact: true })).toBeVisible();
});
test('capturas y diseño móvil sin desbordamiento', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await expect(page.locator('app-university-card')).toHaveCount(8);
  await page.screenshot({ path: 'docs/campus-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('textbox', { name: 'Buscar universidad' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'docs/campus-mobile.png', fullPage: true });
  await page.getByRole('link', { name: /Mis universidades/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Mis universidades.', exact: true }),
  ).toBeVisible();
});
