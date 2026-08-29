import { router } from '@inertiajs/react';
import DT, { type Api } from 'datatables.net-bs5';
import DataTable, { type DataTableRef, type DataTableSlots } from 'datatables.net-react';
import type { RefObject } from 'react';
import { useMemo, useRef } from 'react';
import { Button } from 'react-bootstrap';
import type { UsuarioFilters } from '../../Hooks/useUsuariosTable';
import type { UsuarioRow } from '../../Types/usuario';
import { buildQuery } from '../../Utils/query';
import { usuarios } from '../../Utils/routes';
import { animateRowsIn, fadeOutRows, snapshotRowPositions, type TableRow } from '../../Utils/rowTransitions';
import { EyeIcon, TrashIcon } from '../Common/Icons';
import { ACCIONES_COLUMN, DEFAULT_ORDER_INDEX, usuariosColumns } from './usuariosColumns';
import 'datatables.net-bs5/css/dataTables.bootstrap5.css';

// `DataTable.use` no es un hook de React; se asigna a una variable para que la regla
// `rules-of-hooks` no lo confunda con uno por el prefijo `use`.
const registerDataTablesEngine = DataTable.use;
registerDataTablesEngine(DT);

const ALL_COLUMNS = [...usuariosColumns, ACCIONES_COLUMN];
const LOAD_ERROR = 'No fue posible cargar el listado. Intenta nuevamente.';

/** Respuesta del protocolo server-side de DataTables tal como la emite el backend. */
interface UsuariosDataResponse {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: UsuarioRow[];
}

/** `processing()` es API pública de DataTables 2, pero no está en sus tipos. */
function setProcessing(api: Api<UsuarioRow>, show: boolean): void {
    (api as unknown as { processing: (show: boolean) => void }).processing(show);
}

/** Filas pintadas ahora mismo, con el id del usuario al que corresponden. */
function currentRows(api: Api<UsuarioRow>): TableRow[] {
    const rows: TableRow[] = [];

    api.rows({ page: 'current' }).every(function () {
        const node = this.node();
        if (node instanceof HTMLElement) rows.push({ id: this.data().id, node });
    });

    return rows;
}

interface UsuariosTableProps {
    tableRef: RefObject<DataTableRef | null>;
    filtersRef: RefObject<UsuarioFilters>;
    onError: (message: string) => void;
    onDelete: (row: UsuarioRow) => void;
    onTotalChange: (total: number) => void;
}

export function UsuariosTable({ tableRef, filtersRef, onError, onDelete, onTotalChange }: UsuariosTableProps) {
    // La animación describe un cambio respecto a lo que ya se veía, así que el
    // primer dibujado se pinta directamente.
    const hasDrawnRef = useRef(false);

    const options = useMemo(() => ({
        // La petición se hace a mano en lugar de delegarla en DataTables porque así
        // controlamos *cuándo* se redibuja: entre la respuesta y el redibujado hay
        // que dar tiempo a que las filas descartadas se desvanezcan.
        ajax: (request: object, redraw: (json: UsuariosDataResponse) => void, settings: object) => {
            const api = new DT.Api(settings) as Api<UsuarioRow>;
            const previousRows = currentRows(api);
            const previousPositions = snapshotRowPositions(previousRows);
            const query = buildQuery({
                ...(request as Record<string, unknown>),
                rol: filtersRef.current.rol,
                estado: filtersRef.current.estado,
            });

            fetch(`${usuarios.data()}?${query}`, { headers: { Accept: 'application/json' } })
                .then((response) => (
                    response.ok
                        ? (response.json() as Promise<UsuariosDataResponse>)
                        : Promise.reject(new Error(`HTTP ${response.status}`))
                ))
                // El segundo argumento de `then` acota el manejo del error a la
                // petición: un fallo al animar no debe confundirse con uno de red.
                .then(
                    async (json) => {
                        const incoming = new Set(json.data.map((row) => row.id));
                        const leaving = previousRows.filter(({ id }) => !incoming.has(id));

                        // Los datos ya están: el indicador de carga estorbaría sobre la animación.
                        setProcessing(api, false);
                        await fadeOutRows(leaving.map(({ node }) => node));
                        redraw(json);
                        animateRowsIn(currentRows(api), hasDrawnRef.current ? previousPositions : null);
                        hasDrawnRef.current = true;
                    },
                    () => {
                        setProcessing(api, false);
                        onError(LOAD_ERROR);
                    },
                );
        },
        columns: ALL_COLUMNS.map((column) => ({
            data: column.data,
            name: column.name,
            orderable: column.orderable ?? true,
            searchable: column.searchable ?? true,
        })),
        layout: { topStart: null, topEnd: null, bottomStart: 'info', bottomEnd: 'paging' },
        lengthChange: false,
        pageLength: 10,
        processing: true,
        searching: true,
        serverSide: true,
        order: [[DEFAULT_ORDER_INDEX, 'desc']] as [number, 'desc'][],
        drawCallback: (settings: object) => {
            const api = new DT.Api(settings);
            const info = api.page.info();
            onTotalChange(info.recordsDisplay);

            // Al borrar la última fila de la última página quedaríamos en una página vacía.
            if (info.recordsDisplay > 0 && info.start >= info.recordsDisplay) {
                api.page('last').draw('page');
            }
        },
        language: {
            emptyTable: 'No hay usuarios registrados.',
            zeroRecords: 'No encontramos usuarios con estos criterios.',
            info: 'Mostrando _START_ a _END_ de _TOTAL_ usuarios',
            infoEmpty: 'Mostrando 0 usuarios',
            infoFiltered: '',
            processing: 'Cargando usuarios…',
            paginate: { previous: 'Anterior', next: 'Siguiente' },
        },
    }), [filtersRef, onError, onTotalChange]);

    // Los `slots` se indexan por posición: derivarlos del mismo array que la cabecera
    // evita los índices mágicos y que ambos se desincronicen.
    const slots = useMemo(() => {
        const rendered: DataTableSlots = {};

        ALL_COLUMNS.forEach((column, index) => {
            const render = column.render;
            if (render) rendered[index] = (_value: unknown, row: UsuarioRow) => render(row);
        });

        rendered[ALL_COLUMNS.length - 1] = (_value: unknown, row: UsuarioRow) => (
            <div className="row-actions">
                <Button aria-label={`Ver detalle de ${row.nombre_completo}`} className="row-action"
                    onClick={() => router.visit(usuarios.show(row.id))} variant="primary">
                    <EyeIcon aria-hidden="true" />
                    <span className="row-action__label"><span>Ver detalle</span></span>
                </Button>
                <Button aria-label={`Eliminar a ${row.nombre_completo}`} className="row-action"
                    onClick={() => onDelete(row)} variant="danger">
                    <TrashIcon aria-hidden="true" />
                    <span className="row-action__label"><span>Eliminar</span></span>
                </Button>
            </div>
        );

        return rendered;
    }, [onDelete]);

    return (
        <div className="table-responsive px-4 pb-4">
            <DataTable className="table table-hover align-middle w-100" options={options} ref={tableRef} slots={slots}>
                <caption className="visually-hidden">Usuarios registrados, sus roles y estados</caption>
                <thead>
                    <tr>{ALL_COLUMNS.map((column) => <th key={column.name}>{column.header}</th>)}</tr>
                </thead>
            </DataTable>
        </div>
    );
}
