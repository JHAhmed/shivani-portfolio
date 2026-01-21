import { env } from '$env/dynamic/private';

export async function POST({ request }) {
	let posts = [];

	const response = await fetch(env.HYGRAPH_PROJECT_ENVIRONMENT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.HYGRAPH_PAT}`
		},
		body: JSON.stringify({
			query: `
                query {
                    posts(first: 50) {
                        id
                        title
                        slug
                        description
                    }
                }
            `
		})
	});

	const data = await response.json();

	posts = data.data.posts;
	return new Response(JSON.stringify(posts));
}
