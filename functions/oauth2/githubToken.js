/**
 * GitHub OAuth Token Exchange Function
 * Cloudflare Pages Function for exchanging GitHub OAuth authorization code for access token
 * 
 * Requirements: 3.2, 3.6, 7.2
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const clientId = url.searchParams.get('clientId');

    if (!code) {
      return new Response('Missing authorization code', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const clientSecret = env.GITHUB_CLIENT_SECRET;
    if (!clientSecret) {
      return new Response('Server configuration error: missing client secret', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId || env.GITHUB_CLIENT_ID,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!response.ok) {
      return new Response('Failed to exchange token with GitHub', {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const data = await response.json();

    if (data.error) {
      return new Response(data.error_description || data.error, {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return new Response(data.access_token, {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response('Internal server error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
