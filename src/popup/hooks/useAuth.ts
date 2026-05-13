import { useState, useEffect, useCallback } from 'react';
import { MessageType } from '@shared/types/messages';
import { STORAGE_KEYS } from '@shared/constants';
import type { AuthStatusPayload, DeviceCodePayload } from '@shared/types/messages';

interface AuthHook {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  avatarUrl: string;
  deviceCode: DeviceCodePayload | null;
  isPolling: boolean;
  startAuth: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export function useAuth(): AuthHook {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [deviceCode, setDeviceCode] = useState<DeviceCodePayload | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.AUTH_STATUS_REQUEST,
      }) as { payload: AuthStatusPayload } | undefined;
      
      if (response?.payload) {
        const payload = response.payload;
        setIsAuthenticated(payload.isAuthenticated);
        setUsername(payload.username ?? '');
        setAvatarUrl(payload.avatarUrl ?? '');
      }

      // Check if there is an active device flow to resume
      const stored = await chrome.storage.local.get(STORAGE_KEYS.DEVICE_FLOW_STATE);
      if (stored[STORAGE_KEYS.DEVICE_FLOW_STATE]) {
        const state = stored[STORAGE_KEYS.DEVICE_FLOW_STATE];
        if (Date.now() < state.expiresAt) {
          setDeviceCode({
            userCode: state.userCode,
            verificationUri: state.verificationUri,
            expiresIn: Math.floor((state.expiresAt - Date.now()) / 1000),
          });
          setIsPolling(true);
        } else {
          await chrome.storage.local.remove(STORAGE_KEYS.DEVICE_FLOW_STATE);
        }
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const listener = (message: { type: MessageType; payload?: Record<string, unknown> }) => {
      if (message.type === MessageType.AUTH_COMPLETE) {
        const p = message.payload as { username: string; avatarUrl: string } | undefined;
        setIsAuthenticated(true);
        setUsername(p?.username ?? '');
        setAvatarUrl(p?.avatarUrl ?? '');
        setDeviceCode(null);
        setIsPolling(false);
        setError(null);
      }
      if (message.type === MessageType.AUTH_FAILED) {
        const p = message.payload as { error: string } | undefined;
        setError(p?.error ?? 'Authentication failed');
        setIsPolling(false);
        setDeviceCode(null);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [checkAuth]);

  const startAuth = useCallback(async () => {
    setError(null);
    setIsPolling(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.AUTH_START_DEVICE_FLOW,
      }) as { payload: DeviceCodePayload } | undefined;
      if (response?.payload) {
        setDeviceCode(response.payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start auth');
      setIsPolling(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await chrome.runtime.sendMessage({ type: MessageType.AUTH_LOGOUT });
    setIsAuthenticated(false);
    setUsername('');
    setAvatarUrl('');
  }, []);

  return {
    isAuthenticated,
    isLoading,
    username,
    avatarUrl,
    deviceCode,
    isPolling,
    startAuth,
    logout,
    error,
  };
}
