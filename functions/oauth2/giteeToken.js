/**
 * Gitee OAuth Token Exchange Function
 * Cloudflare Pages Function for exchanging Gitee OAuth authorization code for access token
 * 
 * Requirements: 3.4, 3.6, 7.2
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

    if (!code) {
      return new Response('Missing authorization code', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const clientId = env.GITEE_CLIENT_ID;
    const clientSecret = env.GITEE_CLIENT_SECRET;

    if (!clientSecret) {
      return new Response('Server configuration error: missing client secret', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId || '',
      client_secret: clientSecret,
      redirect_uri: `${url.origin}/oauth2/callback`,
    });

    const response = await fetch('https://gitee.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      return new Response('Failed to exchange token with Gitee', {
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
