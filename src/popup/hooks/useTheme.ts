import { useEffect, useCallback } from 'react';
import { useSettings } from './useSettings';

export function useTheme() {
  const { config, updateConfig } = useSettings();

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    updateConfig({ theme });
  }, [updateConfig]);

  const toggleTheme = useCallback(() => {
    const nextTheme = config?.theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  }, [config?.theme, setTheme]);

  useEffect(() => {
    if (!config?.theme) return;
    
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config?.theme]);

  return {
    theme: config?.theme ?? 'dark',
    setTheme,
    toggleTheme,
  };
}
