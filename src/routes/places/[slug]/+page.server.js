import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const { slug } = params;

  const res = await fetch(env.HYGRAPH_PROJECT_ENVIRONMENT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.HYGRAPH_PAT}`
    },
    body: JSON.stringify({
      query: `
        query PostBySlug($slug: String!) {
          posts(where: { slug: $slug }, first: 1) {
            id
            title
            slug
            description
            content {
              raw
              references {
                __typename
                ... on Asset {
                  id
                  url
                  mimeType
                  fileName
                }
              }
            }
          }
        }
      `,
      variables: { slug }
    })
  });

  const json = await res.json();
  const post = json?.data?.posts?.[0] ?? null;

  if (!post) throw error(404, 'Post not found');

  return { post };
}
