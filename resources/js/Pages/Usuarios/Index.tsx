import { Head, Link } from '@inertiajs/react';
import { Alert, Badge, Button } from 'react-bootstrap';
import { ConfirmDialog } from '@Components/Common/ConfirmDialog';
import { FilterIcon, UserPlusIcon, XIcon } from '@Components/Common/Icons';
import { SearchInput } from '@Components/Common/SearchInput';
import { UsuarioExportMenu } from '@Components/Usuarios/UsuarioExportMenu';
import { UsuarioFiltersPanel } from '@Components/Usuarios/UsuarioFiltersPanel';
import { UsuariosTable } from '@Components/Usuarios/UsuariosTable';
import { useUsuariosTable } from '@Hooks/useUsuariosTable';
import { AdminLayout } from '@Layouts/AdminLayout';
import type { SharedPageProps } from '@Types/inertia';
import type { RoleOption, SelectOption } from '@Types/usuario';
import { usuarios } from '@Utils/routes';
import pageStyles from '@Components/Common/Page.module.css';

interface IndexProps extends SharedPageProps {
    roles: RoleOption[];
    estados: SelectOption[];
}

export default function Index({ roles, estados }: IndexProps) {
    const table = useUsuariosTable(roles, estados);

    return (
        <AdminLayout>
            <Head title="Usuarios" />
            <div
                className={`${pageStyles['page-heading']} d-flex flex-column flex-md-row align-items-stretch align-items-md-end justify-content-between gap-4`}
            >
                <div>
                    <p className={`${pageStyles['page-heading__eyebrow']} text-uppercase text-primary`}>Administración</p>
                    <h1 className={pageStyles['page-heading__title']}>Usuarios</h1>
                    <p className="mb-0 text-body-secondary">
                        Consulta y administra las personas registradas en el sistema.
                    </p>
                </div>
                <div className="d-grid gap-2">
                    <Link
                        className="btn btn-primary d-inline-flex align-items-center justify-content-center"
                        href={usuarios.create()}
                    >
                        <UserPlusIcon aria-hidden="true" className="me-2" />Registrar usuario
                    </Link>
                    <UsuarioExportMenu filters={table.appliedFilters} search={table.search} />
                </div>
            </div>

            <section
                aria-labelledby="users-table-title"
                className="overflow-hidden rounded-4 border bg-body-secondary shadow"
            >
                <h2 className="visually-hidden" id="users-table-title">Listado de usuarios</h2>

                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-end justify-content-between gap-3 p-4">
                    <SearchInput
                        id="user-search"
                        label="Buscar usuarios"
                        onChange={table.setSearch}
                        placeholder="Nombre, email, RUT o rol"
                        value={table.search}
                    />
                    <div className="d-flex flex-shrink-0 align-items-center justify-content-between justify-content-md-start gap-3">
                        {table.totalRows !== null && (
                            <p aria-live="polite" className="mb-0 text-nowrap small fw-semibold text-body-secondary">
                                {table.totalRows === 1 ? '1 usuario' : `${table.totalRows} usuarios`}
                            </p>
                        )}
                        <Button onClick={table.openFilters} variant="outline-primary">
                            <FilterIcon aria-hidden="true" className="me-2" />Filtros
                            {table.activeFilters.length > 0 && (
                                <Badge bg="success" className="ms-2">{table.activeFilters.length}</Badge>
                            )}
                        </Button>
                    </div>
                </div>

                {table.activeFilters.length > 0 && (
                    <div
                        aria-label="Filtros aplicados"
                        className="d-flex flex-wrap gap-2 px-3 px-md-4 pb-3"
                        role="group"
                    >
                        {table.activeFilters.map((chip) => (
                            <button
                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 rounded-pill"
                                key={chip.key}
                                onClick={() => table.removeFilter(chip.key)}
                                type="button"
                            >
                                {chip.label}
                                <XIcon aria-hidden="true" />
                                <span className="visually-hidden">Quitar filtro</span>
                            </button>
                        ))}
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={table.clearFilters}
                            type="button"
                        >
                            Limpiar todo
                        </button>
                    </div>
                )}

                {table.tableError && (
                    <Alert className="mx-4" variant="danger">
                        {table.tableError}{' '}
                        <Alert.Link as="button" onClick={() => table.reloadTable(false)} type="button">
                            Reintentar
                        </Alert.Link>
                    </Alert>
                )}

                <UsuariosTable
                    filtersRef={table.appliedFiltersRef}
                    onDelete={table.requestDelete}
                    onError={table.setTableError}
                    onTotalChange={table.setTotalRows}
                    tableRef={table.tableRef}
                />
            </section>

            <UsuarioFiltersPanel
                draft={table.draftFilters}
                estados={estados}
                onApply={table.applyFilters}
                onClear={table.clearFilters}
                onDraftChange={table.setDraftFilters}
                onHide={table.closeFilters}
                roles={roles}
                show={table.showFilters}
            />

            <ConfirmDialog
                confirmLabel="Eliminar"
                onCancel={table.cancelDelete}
                onConfirm={table.confirmDelete}
                pending={table.deleting}
                pendingLabel="Eliminando…"
                show={Boolean(table.deleteTarget)}
                title="Eliminar usuario"
            >
                ¿Confirmas que deseas eliminar a <strong>{table.deleteTarget?.nombre_completo}</strong>?
                Esta acción no se puede deshacer.
            </ConfirmDialog>
        </AdminLayout>
    );
}
