const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** @param {string} value `YYYY-MM` or `YYYY-MM-DD` */
export function formatMonthYear(value) {
	const [year, month] = value.split('-');
	return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** @param {string} value `YYYY-MM-DD` */
export function formatDate(value) {
	const [year, month, day] = value.split('-');
	return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

/**
 * @param {string} start
 * @param {string | null} end
 */
export function formatRange(start, end) {
	return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : 'Present'}`;
}

/**
 * @param {string | null | undefined} venue
 * @returns {[string, string] | null}
 */
export function splitRoute(venue) {
	if (!venue) return null;
	const parts = venue.split(/\s*(?:→|->)\s*/);
	return parts.length === 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : null;
}
