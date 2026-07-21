import { API, GITHUB_CLIENT_ID, STORAGE_KEYS } from '@shared/constants';
import { AlgoVaultError } from '@shared/errors/taxonomy';
import { ErrorCode } from '@shared/types/errors';
import { setEncrypted } from '../storage/encryptedStorage';
import { setAuthState } from '../storage/configStore';

/**
 * Starts the GitHub OAuth flow using Chrome's built-in identity API.
 *
 * Flow:
 *  1. Opens a Chrome-managed auth popup with GitHub's authorize page
 *  2. User clicks "Authorize" on GitHub
 *  3. Chrome captures the redirect and returns the authorization code
 *  4. Code is exchanged for an access token via the serverless proxy
 *  5. Token is encrypted and stored locally
 *  6. User profile is fetched and saved
 */
export async function startWebAuthFlow(): Promise<{
  username: string;
  avatarUrl: string;
}> {
  // 1. Build the GitHub authorization URL
  const redirectUrl = chrome.identity.getRedirectURL();
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUrl);
  authUrl.searchParams.set('scope', 'repo');

  // 2. Launch Chrome's managed auth popup
  let callbackUrl: string | undefined;
  try {
    callbackUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('cancelled') || message.includes('canceled') || message.includes('closed')) {
      throw new AlgoVaultError(
        ErrorCode.AUTH_DEVICE_FLOW_DENIED,
        'Authorization was cancelled by the user.',
        false,
      );
    }

    throw new AlgoVaultError(
      ErrorCode.AUTH_EXPIRED,
      `GitHub authorization failed: ${message}`,
      false,
    );
  }

  if (!callbackUrl) {
    throw new AlgoVaultError(
      ErrorCode.AUTH_DEVICE_FLOW_DENIED,
      'No response received from GitHub authorization.',
      false,
    );
  }

  // 3. Extract the authorization code from the redirect URL
  const url = new URL(callbackUrl);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    throw new AlgoVaultError(
      ErrorCode.AUTH_DEVICE_FLOW_DENIED,
      `GitHub authorization denied: ${error}`,
      false,
    );
  }

  if (!code) {
    throw new AlgoVaultError(
      ErrorCode.AUTH_EXPIRED,
      'No authorization code received from GitHub.',
      false,
    );
  }

  // 4. Exchange the code for an access token via the proxy
  const tokenResponse = await fetch(API.AUTH_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    throw new AlgoVaultError(
      ErrorCode.AUTH_EXPIRED,
      `Token exchange failed: ${(errorData as any).error_description || (errorData as any).error || tokenResponse.statusText}`,
      true,
    );
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string };

  if (!tokenData.access_token) {
    throw new AlgoVaultError(
      ErrorCode.AUTH_EXPIRED,
      'No access token received from GitHub.',
      true,
    );
  }

  // 5. Encrypt and store the token
  await setEncrypted(STORAGE_KEYS.GITHUB_TOKEN, tokenData.access_token);

  // 6. Fetch the user's GitHub profile
  const userResponse = await fetch(`${API.GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!userResponse.ok) {
    throw AlgoVaultError.authExpired();
  }

  const userData = (await userResponse.json()) as { login: string; avatar_url: string };

  // 7. Save the auth state
  await setAuthState({
    username: userData.login,
    avatarUrl: userData.avatar_url,
  });

  return {
    username: userData.login,
    avatarUrl: userData.avatar_url,
  };
}
