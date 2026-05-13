import { API, GITHUB_CLIENT_ID, ALARM_NAMES, STORAGE_KEYS } from '@shared/constants';
import { AlgoVaultError } from '@shared/errors/taxonomy';
import { setEncrypted } from '../storage/encryptedStorage';
import { setAuthState } from '../storage/configStore';

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
  interval?: number;
}

interface DeviceFlowState {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  interval: number;
  expiresAt: number;
}

export async function startDeviceFlow(): Promise<{
  userCode: string;
  verificationUri: string;
  expiresIn: number;
}> {
  const response = await fetch(API.GITHUB_DEVICE_CODE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: 'repo',
    }),
  });

  if (!response.ok) {
    throw AlgoVaultError.aiGenerationFailed(
      `Device code request failed: ${response.status}`,
    );
  }

  const data = (await response.json()) as DeviceCodeResponse;

  const state: DeviceFlowState = {
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    interval: data.interval,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  await chrome.storage.local.set({ [STORAGE_KEYS.DEVICE_FLOW_STATE]: state });

  chrome.tabs.create({ url: data.verification_uri });

  await chrome.alarms.create(ALARM_NAMES.DEVICE_FLOW_POLL, {
    periodInMinutes: Math.max(data.interval / 60, 0.1),
  });

  return {
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    expiresIn: data.expires_in,
  };
}

export async function pollForToken(): Promise<{
  complete: boolean;
  username?: string;
  avatarUrl?: string;
}> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.DEVICE_FLOW_STATE);
  const state = stored[STORAGE_KEYS.DEVICE_FLOW_STATE] as DeviceFlowState | undefined;

  if (!state) {
    await chrome.alarms.clear(ALARM_NAMES.DEVICE_FLOW_POLL);
    return { complete: false };
  }

  if (Date.now() > state.expiresAt) {
    await chrome.alarms.clear(ALARM_NAMES.DEVICE_FLOW_POLL);
    await chrome.storage.local.remove(STORAGE_KEYS.DEVICE_FLOW_STATE);
    throw AlgoVaultError.deviceFlowExpired();
  }

  const response = await fetch(API.GITHUB_OAUTH_TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      device_code: state.deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    }),
  });

  const data = (await response.json()) as TokenResponse;

  if (data.error === 'authorization_pending') {
    return { complete: false };
  }

  if (data.error === 'slow_down') {
    const newInterval = (data.interval ?? state.interval + 5);
    const updatedState: DeviceFlowState = { ...state, interval: newInterval };
    await chrome.storage.local.set({ [STORAGE_KEYS.DEVICE_FLOW_STATE]: updatedState });
    await chrome.alarms.clear(ALARM_NAMES.DEVICE_FLOW_POLL);
    await chrome.alarms.create(ALARM_NAMES.DEVICE_FLOW_POLL, {
      periodInMinutes: Math.max(newInterval / 60, 0.1),
    });
    return { complete: false };
  }

  if (data.error === 'expired_token') {
    await chrome.alarms.clear(ALARM_NAMES.DEVICE_FLOW_POLL);
    await chrome.storage.local.remove(STORAGE_KEYS.DEVICE_FLOW_STATE);
    throw AlgoVaultError.deviceFlowExpired();
  }

  if (data.error === 'access_denied') {
    await chrome.alarms.clear(ALARM_NAMES.DEVICE_FLOW_POLL);
    await chrome.storage.local.remove(STORAGE_KEYS.DEVICE_FLOW_STATE);
    throw AlgoVaultError.deviceFlowDenied();
  }

  if (data.error) {
    throw new AlgoVaultError(
      'AUTH_DEVICE_FLOW_DENIED' as never,
      data.error_description ?? data.error,
      false,
    );
  }

  if (!data.access_token) {
    return { complete: false };
  }

  await setEncrypted(STORAGE_KEYS.GITHUB_TOKEN, data.access_token);

  const userResponse = await fetch(`${API.GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!userResponse.ok) {
    throw AlgoVaultError.authExpired();
  }

  const userData = (await userResponse.json()) as { login: string; avatar_url: string };

  await setAuthState({
    username: userData.login,
    avatarUrl: userData.avatar_url,
  });

  await chrome.alarms.clear(ALARM_NAMES.DEVICE_FLOW_POLL);
  await chrome.storage.local.remove(STORAGE_KEYS.DEVICE_FLOW_STATE);

  return {
    complete: true,
    username: userData.login,
    avatarUrl: userData.avatar_url,
  };
}

export async function cancelDeviceFlow(): Promise<void> {
  await chrome.alarms.clear(ALARM_NAMES.DEVICE_FLOW_POLL);
  await chrome.storage.local.remove(STORAGE_KEYS.DEVICE_FLOW_STATE);
}
