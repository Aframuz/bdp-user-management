import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AsyncSection } from '@Components/Common/AsyncSection';
import type { TabState } from '@Hooks/useLazyUserTabs';

const renderSection = (state: TabState<string[]>, onRetry = vi.fn()) =>
    render(
        <AsyncSection emptyMessage="Sin resultados." onRetry={onRetry} state={state}>
            {(items) => <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>}
        </AsyncSection>,
    );

describe('AsyncSection', () => {
    it('shows a skeleton while idle or loading', () => {
        const { rerender } = renderSection({ status: 'idle', data: null, error: null });
        expect(screen.getByRole('status', { name: 'Cargando información' })).toBeInTheDocument();

        rerender(
            <AsyncSection emptyMessage="Sin resultados." onRetry={vi.fn()} state={{ status: 'loading', data: null, error: null }}>
                {() => null}
            </AsyncSection>,
        );
        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('shows the empty message when the load succeeds without data', () => {
        renderSection({ status: 'success', data: [], error: null });
        expect(screen.getByText('Sin resultados.')).toBeInTheDocument();
    });

    it('renders the children with the resolved data', () => {
        renderSection({ status: 'success', data: ['uno', 'dos'], error: null });
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('surfaces the error and lets the user retry', () => {
        const onRetry = vi.fn();
        renderSection({ status: 'error', data: null, error: 'Sin conexión' }, onRetry);

        expect(screen.getByText('Sin conexión')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
        expect(onRetry).toHaveBeenCalledOnce();
    });
});
