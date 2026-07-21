import { useState, useEffect, useCallback } from 'react';
import { MessageType } from '@shared/types/messages';
import type { AuthStatusPayload } from '@shared/types/messages';

interface AuthHook {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  username: string;
  avatarUrl: string;
  startAuth: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export function useAuth(): AuthHook {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
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
        setIsAuthenticating(false);
        setError(null);
      }
      if (message.type === MessageType.AUTH_FAILED) {
        const p = message.payload as { error: string } | undefined;
        setError(p?.error ?? 'Authentication failed');
        setIsAuthenticating(false);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [checkAuth]);

  const startAuth = useCallback(async () => {
    setError(null);
    setIsAuthenticating(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.AUTH_START_WEB_FLOW,
      }) as { success?: boolean; error?: string; payload?: { username: string; avatarUrl: string } } | undefined;

      if (response?.error) {
        setError(response.error);
        setIsAuthenticating(false);
      } else if (response?.payload) {
        setIsAuthenticated(true);
        setUsername(response.payload.username);
        setAvatarUrl(response.payload.avatarUrl);
        setIsAuthenticating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start auth');
      setIsAuthenticating(false);
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
    isAuthenticating,
    username,
    avatarUrl,
    startAuth,
    logout,
    error,
  };
}
