export const DB_NAME = 'algovault';
export const DB_VERSION = 1;

export const STORE_SUBMISSIONS = 'submissions';
export const STORE_SYNC_QUEUE = 'sync_queue';
export const STORE_ERROR_LOG = 'error_log';

export const STORAGE_KEYS = {
  VAULT_KEY: 'vault_key',
  GITHUB_TOKEN: 'github_token',
  AUTH_STATE: 'auth_state',
  USER_CONFIG: 'user_config',
  PROCESSED_KEYS: 'processed_keys',
  STATS_CACHE: 'stats_cache',
  MANIFEST_CACHE: 'manifest_cache',
} as const;

export const MANIFEST_PATH = '.algovault/manifest.json';

export const SYNC_STORAGE_KEYS = {
  PREFERENCES: 'preferences',
} as const;

export const API = {
  GITHUB_API: 'https://api.github.com',
  GITHUB_GRAPHQL: 'https://api.github.com/graphql',
  AUTH_PROXY: import.meta.env.VITE_AUTH_PROXY_URL as string || '',
} as const;

export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string || '';

export const RETRY = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 1000,
  QUEUE_INTERVAL_MIN: 5,
  MAX_QUEUE_SIZE: 100,
  PROCESSED_KEYS_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const ALARM_NAMES = {
  PROCESS_QUEUE: 'algovault-process-queue',
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
