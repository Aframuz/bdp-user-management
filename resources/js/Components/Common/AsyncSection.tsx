import type { ReactNode } from 'react';
import type { TabState } from '@Hooks/useLazyUserTabs';
import { EmptyState, ErrorState, LoadingState, type SkeletonVariant } from './AsyncState';

interface AsyncSectionProps<T> {
    state: TabState<T>;
    onRetry: () => void;
    /** Mensaje mostrado cuando la carga fue correcta pero no hay datos que pintar. */
    emptyMessage: ReactNode;
    /** Por defecto considera vacío un array sin elementos o un dato nulo. */
    isEmpty?: (data: T) => boolean;
    skeleton?: SkeletonVariant;
    children: (data: T) => ReactNode;
}

const defaultIsEmpty = (data: unknown) => data == null || (Array.isArray(data) && data.length === 0);

/**
 * Resuelve en un único lugar los estados cargando / error / vacío / con datos
 * que exige el enunciado, para que cada tab solo describa su marcado.
 */
export function AsyncSection<T>({
    state,
    onRetry,
    emptyMessage,
    isEmpty = defaultIsEmpty,
    skeleton = 'list',
    children,
}: AsyncSectionProps<T>) {
    if (state.status === 'idle' || state.status === 'loading') return <LoadingState variant={skeleton} />;
    if (state.status === 'error') {
        return <ErrorState message={state.error ?? 'Ocurrió un error inesperado.'} onRetry={onRetry} />;
    }
    if (state.data === null || isEmpty(state.data)) return <EmptyState>{emptyMessage}</EmptyState>;

    return <>{children(state.data)}</>;
}
