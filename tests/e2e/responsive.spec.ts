import { expect, test } from '@playwright/test';

test('core controls remain usable on a mobile viewport', async ({ page }) => {
    await page.goto('/usuarios');
    await expect(page.getByRole('link', { name: 'Registrar usuario' })).toBeVisible();
    await page.getByRole('button', { name: /^Filtros/ }).click();
    await expect(page.getByRole('heading', { name: 'Filtrar usuarios' })).toBeVisible();
    await page.getByRole('button', { name: 'Aplicar' }).click();

    await page.getByRole('link', { name: 'Registrar usuario' }).click();
    await expect(page.getByLabel('Nombre')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guardar usuario' })).toBeVisible();
});
