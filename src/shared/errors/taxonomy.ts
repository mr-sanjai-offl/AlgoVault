import { ErrorCode } from '../types/errors';

export class AlgoVaultError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly retryable: boolean;
  public readonly context: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    userMessage: string,
    retryable: boolean,
    context?: Record<string, unknown>,
  ) {
    super(userMessage);
    this.name = 'AlgoVaultError';
    this.code = code;
    this.userMessage = userMessage;
    this.retryable = retryable;
    this.context = context ?? {};
  }

  static extraction(message: string, context?: Record<string, unknown>): AlgoVaultError {
    return new AlgoVaultError(ErrorCode.EXTRACTION_FAILED, message, false, context);
  }

  static authExpired(context?: Record<string, unknown>): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.AUTH_EXPIRED,
      'GitHub authentication expired. Please reconnect.',
      true,
      context,
    );
  }

  static deviceFlowDenied(): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.AUTH_DEVICE_FLOW_DENIED,
      'GitHub authorization was denied by the user.',
      false,
    );
  }

  static deviceFlowExpired(): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.AUTH_DEVICE_FLOW_EXPIRED,
      'Device code expired. Please try again.',
      false,
    );
  }

  static githubRateLimited(retryAfter: number): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.GITHUB_RATE_LIMITED,
      `GitHub API rate limited. Retry after ${retryAfter}s.`,
      true,
      { retryAfter },
    );
  }

  static githubConflict(path: string): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.GITHUB_CONFLICT,
      `Conflict updating ${path}. Will re-fetch and retry.`,
      true,
      { path },
    );
  }

  static githubPermissionDenied(): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.GITHUB_PERMISSION_DENIED,
      'Missing permissions. Ensure the token has "repo" scope.',
      false,
    );
  }

  static githubRepoNotFound(repo: string): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.GITHUB_REPO_NOT_FOUND,
      `Repository "${repo}" not found.`,
      false,
      { repo },
    );
  }

  static aiGenerationFailed(message: string): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.AI_GENERATION_FAILED,
      `AI generation failed: ${message}`,
      true,
    );
  }

  static aiSchemaValidation(message: string): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.AI_SCHEMA_VALIDATION_FAILED,
      `AI response validation failed: ${message}`,
      true,
    );
  }

  static aiKeyInvalid(): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.AI_KEY_INVALID,
      'OpenRouter API key is invalid. Check your settings.',
      false,
    );
  }

  static networkTimeout(): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.NETWORK_TIMEOUT,
      'Network request timed out. Please check your connection.',
      true,
    );
  }

  static queueOverflow(): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.QUEUE_OVERFLOW,
      'Sync queue is full. Please wait for current items to process.',
      false,
    );
  }

  static idempotencyCollision(dedupKey: string): AlgoVaultError {
    return new AlgoVaultError(
      ErrorCode.IDEMPOTENCY_COLLISION,
      'This submission has already been synced.',
      false,
      { dedupKey },
    );
  }

  static fromUnknown(error: unknown): AlgoVaultError {
    if (error instanceof AlgoVaultError) return error;
    const message = error instanceof Error ? error.message : String(error);
    return new AlgoVaultError(
      ErrorCode.NETWORK_TIMEOUT,
      message,
      true,
      { originalError: message },
    );
  }
}
