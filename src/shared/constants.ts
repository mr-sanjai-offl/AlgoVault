export const DB_NAME = 'algovault';
export const DB_VERSION = 1;

export const STORE_SUBMISSIONS = 'submissions';
export const STORE_SYNC_QUEUE = 'sync_queue';
export const STORE_ERROR_LOG = 'error_log';

export const STORAGE_KEYS = {
  VAULT_KEY: 'vault_key',
  GITHUB_TOKEN: 'github_token',
  OPENROUTER_KEY: 'openrouter_key',
  AUTH_STATE: 'auth_state',
  USER_CONFIG: 'user_config',
  PROCESSED_KEYS: 'processed_keys',
  STATS_CACHE: 'stats_cache',
  DEVICE_FLOW_STATE: 'device_flow_state',
  MANIFEST_CACHE: 'manifest_cache',
} as const;

export const MANIFEST_PATH = '.algovault/manifest.json';

export const SYNC_STORAGE_KEYS = {
  PREFERENCES: 'preferences',
} as const;

export const API = {
  GITHUB_DEVICE_CODE: 'https://github.com/login/device/code',
  GITHUB_OAUTH_TOKEN: 'https://github.com/login/oauth/access_token',
  GITHUB_API: 'https://api.github.com',
  GITHUB_GRAPHQL: 'https://api.github.com/graphql',
  OPENROUTER_BASE: 'https://openrouter.ai/api/v1',
  OPENROUTER_COMPLETIONS: 'https://openrouter.ai/api/v1/chat/completions',
} as const;

export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string || '';

export const RETRY = {
  MAX_NETWORK_RETRIES: 5,
  MAX_AI_RETRIES: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 60000,
  QUEUE_ALARM_INTERVAL_MINUTES: 5,
  MAX_QUEUE_SIZE: 100,
  PROCESSED_KEYS_TTL_MS: 24 * 60 * 60 * 1000,
} as const;

export const ALARM_NAMES = {
  PROCESS_QUEUE: 'algovault-process-queue',
  DEVICE_FLOW_POLL: 'algovault-device-flow-poll',
} as const;

export const DASHBOARD_MARKERS = {
  START: '<!-- ALGOVAULT:STATS:START -->',
  END: '<!-- ALGOVAULT:STATS:END -->',
} as const;

export const LANGUAGE_EXTENSIONS: Record<string, string> = {
  python: '.py',
  python3: '.py',
  java: '.java',
  'c++': '.cpp',
  cpp: '.cpp',
  'g++': '.cpp',
  c: '.c',
  gcc: '.c',
  javascript: '.js',
  typescript: '.ts',
  go: '.go',
  rust: '.rs',
  kotlin: '.kt',
  swift: '.swift',
  scala: '.scala',
  ruby: '.rb',
  php: '.php',
  csharp: '.cs',
  'c#': '.cs',
  dart: '.dart',
  elixir: '.ex',
  erlang: '.erl',
  racket: '.rkt',
  mysql: '.sql',
  postgresql: '.sql',
  mssql: '.sql',
  sql: '.sql',
};

export const LANGUAGE_FOLDER_NAMES: Record<string, string> = {
  python: 'python',
  python3: 'python',
  java: 'java',
  'c++': 'cpp',
  cpp: 'cpp',
  'g++': 'cpp',
  c: 'c',
  gcc: 'c',
  javascript: 'javascript',
  typescript: 'typescript',
  go: 'go',
  rust: 'rust',
  kotlin: 'kotlin',
  swift: 'swift',
  scala: 'scala',
  ruby: 'ruby',
  php: 'php',
  csharp: 'csharp',
  'c#': 'csharp',
  dart: 'dart',
  mysql: 'sql',
  postgresql: 'sql',
  mssql: 'sql',
  sql: 'sql',
};

export const SOLUTION_FILE_NAMES: Record<string, string> = {
  python: 'solution.py',
  python3: 'solution.py',
  java: 'Solution.java',
  'c++': 'solution.cpp',
  cpp: 'solution.cpp',
  'g++': 'solution.cpp',
  c: 'solution.c',
  gcc: 'solution.c',
  javascript: 'solution.js',
  typescript: 'solution.ts',
  go: 'solution.go',
  rust: 'solution.rs',
  kotlin: 'Solution.kt',
  swift: 'solution.swift',
  scala: 'Solution.scala',
  ruby: 'solution.rb',
  php: 'solution.php',
  csharp: 'Solution.cs',
  'c#': 'Solution.cs',
  dart: 'solution.dart',
  mysql: 'solution.sql',
  postgresql: 'solution.sql',
  mssql: 'solution.sql',
  sql: 'solution.sql',
};
