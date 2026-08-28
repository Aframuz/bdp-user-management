import { router } from '@inertiajs/react';
import type { DataTableRef } from 'datatables.net-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RoleOption, SelectOption, UsuarioRow } from '../Types/usuario';
import { usuarios } from '../Utils/routes';

export interface UsuarioFilters {
    rol: string;
    estado: string;
}

export interface ActiveFilterChip {
    key: keyof UsuarioFilters;
    label: string;
}

const EMPTY_FILTERS: UsuarioFilters = { rol: '', estado: '' };
const SEARCH_DEBOUNCE_MS = 350;

/**
 * Concentra toda la lógica del listado (búsqueda con debounce, filtros aplicados
 * frente a borradores del panel, recarga y borrado) para que la página solo componga
 * presentación.
 */
export function useUsuariosTable(roles: RoleOption[], estados: SelectOption[]) {
    const tableRef = useRef<DataTableRef>(null);
    // La petición AJAX de DataTables lee los filtros de una ref: no debe capturar
    // el valor del render en el que se creó la configuración de la tabla.
    const appliedFiltersRef = useRef<UsuarioFilters>(EMPTY_FILTERS);
    const isFirstSearchRun = useRef(true);

    const [search, setSearch] = useState('');
    const [appliedFilters, setAppliedFilters] = useState<UsuarioFilters>(EMPTY_FILTERS);
    const [draftFilters, setDraftFilters] = useState<UsuarioFilters>(EMPTY_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UsuarioRow | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [tableError, setTableError] = useState<string | null>(null);
    const [totalRows, setTotalRows] = useState<number | null>(null);

    const reloadTable = useCallback((resetPaging = true) => {
        setTableError(null);
        tableRef.current?.dt()?.ajax.reload(undefined, resetPaging);
    }, []);

    useEffect(() => {
        // La tabla ya hace su primera consulta al montarse; evitamos duplicarla.
        if (isFirstSearchRun.current) {
            isFirstSearchRun.current = false;
            return;
        }

        const timer = window.setTimeout(
            () => tableRef.current?.dt()?.search(search).draw(),
            SEARCH_DEBOUNCE_MS,
        );

        return () => window.clearTimeout(timer);
    }, [search]);

    const openFilters = useCallback(() => {
        // Los borradores parten siempre de lo realmente aplicado: si se cerró el panel
        // sin aplicar, esos cambios no deben sobrevivir a la siguiente apertura.
        setDraftFilters(appliedFilters);
        setShowFilters(true);
    }, [appliedFilters]);

    const commitFilters = useCallback((filters: UsuarioFilters) => {
        appliedFiltersRef.current = filters;
        setAppliedFilters(filters);
        setDraftFilters(filters);
        setShowFilters(false);
        reloadTable();
    }, [reloadTable]);

    const removeFilter = useCallback((key: keyof UsuarioFilters) => {
        commitFilters({ ...appliedFiltersRef.current, [key]: '' });
    }, [commitFilters]);

    const confirmDelete = useCallback(() => {
        if (!deleteTarget) return;
        setDeleting(true);

        router.delete(usuarios.destroy(deleteTarget.id), {
            preserveScroll: true,
            // Sin esto Inertia remonta la página y se pierden búsqueda, filtros y la
            // referencia a la tabla, dejando el `reload` posterior sin efecto.
            preserveState: true,
            onSuccess: () => {
                setDeleteTarget(null);
                reloadTable(false);
            },
            onError: () => setTableError('No fue posible eliminar el usuario.'),
            onFinish: () => setDeleting(false),
        });
    }, [deleteTarget, reloadTable]);

    const activeFilters = useMemo<ActiveFilterChip[]>(() => {
        const chips: ActiveFilterChip[] = [];
        const rol = roles.find((option) => String(option.id) === appliedFilters.rol);
        const estado = estados.find((option) => option.value === appliedFilters.estado);

        if (rol) chips.push({ key: 'rol', label: `Rol: ${rol.nombre}` });
        if (estado) chips.push({ key: 'estado', label: `Estado: ${estado.label}` });

        return chips;
    }, [appliedFilters, roles, estados]);

    return {
        tableRef,
        appliedFiltersRef,
        search,
        setSearch,
        draftFilters,
        setDraftFilters,
        appliedFilters,
        activeFilters,
        removeFilter,
        showFilters,
        openFilters,
        closeFilters: () => setShowFilters(false),
        applyFilters: () => commitFilters(draftFilters),
        clearFilters: () => commitFilters(EMPTY_FILTERS),
        deleteTarget,
        requestDelete: setDeleteTarget,
        cancelDelete: () => setDeleteTarget(null),
        confirmDelete,
        deleting,
        tableError,
        setTableError,
        totalRows,
        setTotalRows,
        reloadTable,
    };
}
