/**
 * AlgoVault Auth Proxy — Cloudflare Worker
 * 
 * Exchanges GitHub OAuth authorization codes for access tokens.
 * This keeps the client_secret secure on the server side.
 * 
 * Environment secrets (set via `wrangler secret put`):
 *   - GITHUB_CLIENT_ID
 *   - GITHUB_CLIENT_SECRET
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      );
    }

    try {
      const { code } = await request.json();

      if (!code || typeof code !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Missing or invalid authorization code' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
        );
      }

      // Exchange the code for an access token with GitHub
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      // GitHub returns errors in the body, not as HTTP status codes
      if (tokenData.error) {
        return new Response(
          JSON.stringify({ error: tokenData.error, error_description: tokenData.error_description }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
        );
      }

      // Return only the access_token (don't expose unnecessary fields)
      return new Response(
        JSON.stringify({ access_token: tokenData.access_token }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      );
    }
  },
};
