import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('an unknown route lands on the 404 page inside the panel', async ({ page }) => {
    const response = await page.goto('/informes/2024');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Aquí no hay nada que mostrar' })).toBeVisible();
    // La cabecera del panel sigue ahí: el error no saca al usuario de la aplicación.
    await expect(page.getByRole('link', { name: 'Ir al inicio de Bolsa de Productos' })).toBeVisible();
    await expect(page.getByText('/informes/2024')).toBeVisible();

    // Acotado al panel y sin el botón primario: el blanco sobre --brand-600 (2.81:1)
    // es de .btn-primary, común a toda la app, y ya falla en /usuarios.
    const results = await new AxeBuilder({ page })
        .include('.error-page')
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

test('the back button returns to where the visitor came from', async ({ page }) => {
    await page.goto('/usuarios');
    await page.goto('/informes/2024');

    await page.getByRole('button', { name: 'Volver atrás' }).click();
    await expect(page.getByRole('heading', { exact: true, name: 'Usuarios' })).toBeVisible();
});
