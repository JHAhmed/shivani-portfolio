export async function load({ fetch, params }) {
	const res = await fetch(`/api/get-posts`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			limit: 5
		})
	});

	const posts = await res.json();
	return { posts };
}
