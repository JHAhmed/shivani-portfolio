import { describe, expect, it } from 'vitest';
import { formatDate, formatMonthYear, formatRange, splitRoute } from './format.js';

describe('format', () => {
	it('formats year-month and full dates', () => {
		expect(formatMonthYear('2024-10')).toBe('Oct 2024');
		expect(formatMonthYear('2025-09-14')).toBe('Sep 2025');
		expect(formatDate('2026-10-03')).toBe('3 Oct 2026');
	});

	it('formats ranges, with Present for open-ended roles', () => {
		expect(formatRange('2023-10', '2024-10')).toBe('Oct 2023 – Oct 2024');
		expect(formatRange('2024-10', null)).toBe('Oct 2024 – Present');
	});

	it('splits travel routes written with an arrow', () => {
		expect(splitRoute('MAS → YCD')).toEqual(['MAS', 'YCD']);
		expect(splitRoute('MAS -> LEH')).toEqual(['MAS', 'LEH']);
		expect(splitRoute('Rasanai, Chennai')).toBeNull();
		expect(splitRoute(null)).toBeNull();
	});
});
