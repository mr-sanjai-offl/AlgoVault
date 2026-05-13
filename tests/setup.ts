import { vi } from 'vitest';

// Mock chrome APIs
const storageMock: Record<string, unknown> = {};

const chromeStorageArea = {
  get: vi.fn(async (keys: string | string[]) => {
    if (typeof keys === 'string') {
      return { [keys]: storageMock[keys] };
    }
    const result: Record<string, unknown> = {};
    for (const k of keys) {
      result[k] = storageMock[k];
    }
    return result;
  }),
  set: vi.fn(async (items: Record<string, unknown>) => {
    Object.assign(storageMock, items);
  }),
  remove: vi.fn(async (keys: string | string[]) => {
    const arr = typeof keys === 'string' ? [keys] : keys;
    for (const k of arr) {
      delete storageMock[k];
    }
  }),
  clear: vi.fn(async () => {
    for (const k of Object.keys(storageMock)) {
      delete storageMock[k];
    }
  }),
};

const chromeMock = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
    lastError: null,
  },
  storage: {
    local: chromeStorageArea,
    sync: chromeStorageArea,
    session: chromeStorageArea,
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    create: vi.fn(),
  },
  notifications: {
    create: vi.fn(),
  },
};

vi.stubGlobal('chrome', chromeMock);

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_GITHUB_CLIENT_ID: 'test-client-id',
    },
  },
});
