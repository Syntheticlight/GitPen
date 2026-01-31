/**
 * Configuration Endpoint Function
 * Cloudflare Pages Function for returning public configuration
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Build configuration object with defaults for missing environment variables
  const config = {
    githubClientId: env.GITHUB_CLIENT_ID || '',
    giteeClientId: env.GITEE_CLIENT_ID || '',
    allowSponsorship: false,
  };

  return new Response(JSON.stringify(config), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
