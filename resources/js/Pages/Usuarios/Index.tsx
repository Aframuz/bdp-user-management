import { Head, Link } from '@inertiajs/react';
import { Alert, Badge, Button } from 'react-bootstrap';
import { Funnel, PersonPlus, XLg } from 'react-bootstrap-icons';
import { ConfirmDialog } from '../../Components/Common/ConfirmDialog';
import { SearchInput } from '../../Components/Common/SearchInput';
import { UsuarioExportMenu } from '../../Components/Usuarios/UsuarioExportMenu';
import { UsuarioFiltersPanel } from '../../Components/Usuarios/UsuarioFiltersPanel';
import { UsuariosTable } from '../../Components/Usuarios/UsuariosTable';
import { useUsuariosTable } from '../../Hooks/useUsuariosTable';
import { AdminLayout } from '../../Layouts/AdminLayout';
import type { SharedPageProps } from '../../Types/inertia';
import type { RoleOption, SelectOption } from '../../Types/usuario';
import { usuarios } from '../../Utils/routes';

interface IndexProps extends SharedPageProps {
    roles: RoleOption[];
    estados: SelectOption[];
}

export default function Index({ roles, estados }: IndexProps) {
    const table = useUsuariosTable(roles, estados);

    return (
        <AdminLayout>
            <Head title="Usuarios" />
            <div className="page-heading page-heading--actions">
                <div>
                    <p className="eyebrow">Administración</p>
                    <h1>Usuarios</h1>
                    <p>Consulta y administra las personas registradas en el sistema.</p>
                </div>
                <div className="page-heading__actions">
                    <Link className="btn btn-primary" href={usuarios.create()}>
                        <PersonPlus aria-hidden="true" className="me-2" />Registrar usuario
                    </Link>
                    <UsuarioExportMenu filters={table.appliedFilters} search={table.search} />
                </div>
            </div>

            <section aria-labelledby="users-table-title" className="content-card table-card">
                <h2 className="visually-hidden" id="users-table-title">Listado de usuarios</h2>

                <div className="table-toolbar">
                    <SearchInput
                        id="user-search"
                        label="Buscar usuarios"
                        onChange={table.setSearch}
                        placeholder="Nombre, email, RUT o rol"
                        value={table.search}
                    />
                    <div className="table-toolbar__actions">
                        {table.totalRows !== null && (
                            <p aria-live="polite" className="table-count">
                                {table.totalRows === 1 ? '1 usuario' : `${table.totalRows} usuarios`}
                            </p>
                        )}
                        <Button onClick={table.openFilters} variant="outline-primary">
                            <Funnel aria-hidden="true" className="me-2" />Filtros
                            {table.activeFilters.length > 0 && (
                                <Badge bg="primary" className="ms-2">{table.activeFilters.length}</Badge>
                            )}
                        </Button>
                    </div>
                </div>

                {table.activeFilters.length > 0 && (
                    <div aria-label="Filtros aplicados" className="filter-chips" role="group">
                        {table.activeFilters.map((chip) => (
                            <button
                                className="filter-chip"
                                key={chip.key}
                                onClick={() => table.removeFilter(chip.key)}
                                type="button"
                            >
                                {chip.label}
                                <XLg aria-hidden="true" />
                                <span className="visually-hidden">Quitar filtro</span>
                            </button>
                        ))}
                        <button className="filter-chip filter-chip--clear" onClick={table.clearFilters} type="button">
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
