import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
const createdEmail = `elena.e2e+${Date.now()}@example.test`;

test('lists, searches and filters users with server-side pagination', async ({ page }) => {
    await page.goto('/usuarios');
    await expect(page.getByRole('heading', { exact: true, name: 'Usuarios' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    await page.getByLabel('Buscar usuarios').fill('Ana Demo');
    await expect(page.getByRole('cell', { exact: true, name: 'Ana Demo' })).toBeVisible();

    await page.getByRole('button', { name: /^Filtros/ }).click();
    await page.getByLabel('Rol', { exact: true }).selectOption({ label: 'Admin' });
    await page.getByLabel('Estado', { exact: true }).selectOption('activo');
    await page.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByRole('cell', { name: 'Admin' })).toBeVisible();

    await page.getByRole('button', { name: /^Filtros/ }).click();
    await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
});

test('downloads all users or only the current filtered result as csv', async ({ page }) => {
    await page.goto('/usuarios');

    await page.getByRole('button', { name: 'Exportar a csv' }).click();
    const allUsersDownloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Todos los usuarios' }).click();
    const allUsersDownload = await allUsersDownloadPromise;

    expect(allUsersDownload.suggestedFilename()).toMatch(/^usuarios-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(new URL(allUsersDownload.url()).search).toBe('');

    await page.getByLabel('Buscar usuarios').fill('Ana Demo');
    await expect(page.getByRole('cell', { exact: true, name: 'Ana Demo' })).toBeVisible();
    await page.getByRole('button', { name: /^Filtros/ }).click();
    await page.getByLabel('Rol', { exact: true }).selectOption({ label: 'Admin' });
    await page.getByLabel('Estado', { exact: true }).selectOption('activo');
    await page.getByRole('button', { name: 'Aplicar' }).click();

    await page.getByRole('button', { name: 'Exportar a csv' }).click();
    const filteredDownloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Solo filtrados' }).click();
    const filteredDownload = await filteredDownloadPromise;
    const filteredUrl = new URL(filteredDownload.url());

    expect(filteredUrl.searchParams.get('search')).toBe('Ana Demo');
    expect(filteredUrl.searchParams.get('rol')).not.toBeNull();
    expect(filteredUrl.searchParams.get('estado')).toBe('activo');
});

test('validates and creates a complete user', async ({ page }) => {
    await page.goto('/usuarios/create');
    await page.getByRole('button', { name: 'Guardar usuario' }).click();
    await expect(page.getByText('Revisa los campos marcados antes de continuar.')).toBeVisible();
    await expect(page.getByLabel('Nombre')).toBeFocused();

    await page.getByLabel('Nombre').fill('Elena');
    await page.getByLabel('Apellido').fill('E2E');
    await page.getByLabel('Email').fill(createdEmail);
    await page.getByLabel('RUT/RUN').fill('17.111.111-1');
    await page.getByLabel('Teléfono').fill('912345678');
    await page.getByLabel('Rol').selectOption({ label: 'Editor' });
    await page.getByLabel('Estado').selectOption('activo');
    await page.getByLabel('Calle').fill('Calle Prueba 100');
    await page.getByLabel('Ciudad').fill('Santiago');
    await page.getByLabel('Código postal').fill('7500000');
    await page.getByRole('textbox', { exact: true, name: 'Nota' }).fill('Creado mediante Playwright');
    await page.getByRole('button', { name: 'Guardar usuario' }).click();

    await expect(page).toHaveURL(/\/usuarios$/);
    await expect(page.getByText('Usuario registrado correctamente.')).toBeVisible();
    await page.getByLabel('Buscar usuarios').fill(createdEmail);
    await expect(page.getByRole('cell', { exact: true, name: createdEmail })).toBeVisible();
});

test('shows backend validation errors', async ({ page }) => {
    await page.goto('/usuarios/create');
    await page.getByLabel('Nombre').fill('Duplicada');
    await page.getByLabel('Apellido').fill('Demo');
    await page.getByLabel('Email').fill('ana.demo@example.test');
    await page.getByLabel('RUT/RUN').fill('1-9');
    await page.getByLabel('Rol').selectOption({ label: 'Admin' });
    await page.getByLabel('Estado').selectOption('activo');
    await page.getByLabel('Calle').fill('Calle Uno');
    await page.getByLabel('Ciudad').fill('Santiago');
    await page.getByRole('textbox', { exact: true, name: 'Nota' }).fill('Duplicada');
    await page.getByRole('button', { name: 'Guardar usuario' }).click();

    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#email-error')).toBeVisible();
});

test('loads each detail tab only when it is activated and shows empty states', async ({ page }) => {
    await page.goto('/usuarios');
    await page.getByLabel('Buscar usuarios').fill('Bruno Sin Datos');
    await page.getByRole('button', { name: /Ver detalle de Bruno Sin Datos/ }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Bruno Sin Datos' })).toBeVisible();
    await expect(page.getByText('9.876.543-2')).toBeVisible();

    const addressResponse = page.waitForResponse(/\/tabs\/direcciones$/);
    await page.getByRole('tab', { name: 'Direcciones' }).click();
    await addressResponse;
    await expect(page.getByText(/no tiene una dirección/i)).toBeVisible();

    const notesResponse = page.waitForResponse(/\/tabs\/notas$/);
    await page.getByRole('tab', { name: 'Notas' }).click();
    await notesResponse;
    await expect(page.getByText(/no tiene notas/i)).toBeVisible();
});

test('cancels and confirms deletion', async ({ page }) => {
    await page.goto('/usuarios');
    await page.getByLabel('Buscar usuarios').fill(createdEmail);
    const createdUserRow = page.getByRole('row').filter({
        has: page.getByRole('cell', { exact: true, name: createdEmail }),
    });
    await expect(createdUserRow).toBeVisible();
    await createdUserRow.getByRole('button', { name: /Eliminar a Elena E2E/ }).click();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(createdUserRow).toBeVisible();

    await createdUserRow.getByRole('button', { name: /Eliminar a Elena E2E/ }).click();
    await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
    await expect(page.getByText('Usuario eliminado correctamente.')).toBeVisible();
});

test('keeps search and filters after deleting, and toasts every deletion', async ({ page }) => {
    // Dos usuarios desechables, identificados por un sello único para que la
    // prueba no dependa de los datos que dejen otras ejecuciones.
    const stamp = String(Date.now());
    const emails = [0, 1].map((index) => `temporal${index}+${stamp}@example.test`);

    for (const [index, email] of emails.entries()) {
        await page.goto('/usuarios/create');
        await page.getByLabel('Nombre').fill('Temporal');
        await page.getByLabel('Apellido').fill(`Borrable${index}`);
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('RUT/RUN').fill(`2${index}.111.111-1`);
        await page.getByLabel('Rol').selectOption({ label: 'Editor' });
        await page.getByLabel('Estado').selectOption('activo');
        await page.getByLabel('Calle').fill('Calle Temporal 1');
        await page.getByLabel('Ciudad').fill('Santiago');
        await page.getByRole('textbox', { exact: true, name: 'Nota' }).fill('Usuario temporal');
        await page.getByRole('button', { name: 'Guardar usuario' }).click();
        await expect(page).toHaveURL(/\/usuarios$/);
    }

    await page.goto('/usuarios');
    await page.getByLabel('Buscar usuarios').fill(stamp);
    await page.getByRole('button', { name: /^Filtros/ }).click();
    await page.getByLabel('Estado', { exact: true }).selectOption('activo');
    await page.getByRole('button', { name: 'Aplicar' }).click();

    const filterChip = page.getByRole('button', { name: 'Quitar filtro' });
    const toast = page.getByText('Usuario eliminado correctamente.');
    await expect(filterChip).toBeVisible();

    for (const email of emails) {
        const row = page.getByRole('row').filter({ has: page.getByRole('cell', { exact: true, name: email }) });
        await expect(row).toBeVisible();
        await row.getByRole('button', { name: /^Eliminar a / }).click();
        await page.getByRole('button', { exact: true, name: 'Eliminar' }).click();

        // El mismo texto debe volver a anunciarse en el segundo borrado.
        await expect(toast).toBeVisible();
        await expect(row).toBeHidden();

        // Búsqueda y filtros sobreviven a la visita de borrado.
        await expect(page.getByLabel('Buscar usuarios')).toHaveValue(stamp);
        await expect(filterChip).toBeVisible();

        // Se cierra para que la siguiente aparición sea observable de verdad.
        await page.getByRole('button', { name: 'Cerrar notificación' }).click();
        await expect(toast).toBeHidden();
    }
});

test('main page has no automatically detectable accessibility violations', async ({ page }) => {
    const consoleIssues: string[] = [];
    page.on('console', (message) => {
        if (message.type() === 'warning' || message.type() === 'error') {
            consoleIssues.push(`${message.type()}: ${message.text()}`);
        }
    });
    page.on('pageerror', (error) => consoleIssues.push(`pageerror: ${error.message}`));

    await page.goto('/usuarios');
    await expect(page.getByRole('table')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();

    expect(consoleIssues).toEqual([]);
    expect(results.violations).toEqual([]);
});
