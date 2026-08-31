import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('an unknown route lands on the 404 page inside the panel', async ({ page }) => {
    const response = await page.goto('/informes/2024');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Aquí no hay nada que mostrar' })).toBeVisible();
    // La cabecera del panel sigue ahí: el error no saca al usuario de la aplicación.
    await expect(page.getByRole('link', { name: 'Ir al inicio de Bolsa de Productos' })).toBeVisible();
    await expect(page.getByText('/informes/2024')).toBeVisible();

    // El botón primario conserva el verde claro de marca; su deuda de contraste es
    // global y no forma parte del panel 404 que se audita en esta prueba.
    const results = await new AxeBuilder({ page })
        .include('[data-not-found-panel]')
        .exclude('.btn-primary')
        .analyze();
    expect(results.violations).toEqual([]);

    await page.getByRole('link', { name: 'Ir a Usuarios' }).click();
    await expect(page.getByRole('heading', { exact: true, name: 'Usuarios' })).toBeVisible();
});

test('a user id that does not exist gets the same page', async ({ page }) => {
    const response = await page.goto('/usuarios/999999');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Aquí no hay nada que mostrar' })).toBeVisible();
});

test('an invalid user id shows a safe 500 page inside the panel', async ({ page }) => {
    const response = await page.goto('/usuarios/asdf');

    expect(response?.status()).toBe(500);
    await expect(page.getByRole('heading', { level: 1, name: 'No pudimos completar la solicitud' })).toBeVisible();
    await expect(page.getByText('/usuarios/asdf')).toBeVisible();
    await expect(page.getByText(/SQLSTATE|bigint/i)).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Ir a Usuarios' })).toBeVisible();
});

test('the back button returns to where the visitor came from', async ({ page }) => {
    await page.goto('/usuarios');
    await page.goto('/informes/2024');

    await page.getByRole('button', { name: 'Volver atrás' }).click();
    await expect(page.getByRole('heading', { exact: true, name: 'Usuarios' })).toBeVisible();
});
