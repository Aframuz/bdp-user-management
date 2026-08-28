import { describe, expect, it } from 'vitest';
import { formatDate } from '../../resources/js/Utils/date';

describe('formatDate', () => {
    it('formats a valid date for Chile and handles missing or invalid values', () => {
        expect(formatDate('2026-08-28T12:00:00Z')).toMatch(/28.*(08|ago).*2026/i);
        expect(formatDate(null)).toBe('Sin información');
        expect(formatDate('invalid')).toBe('Fecha inválida');
    });
});
