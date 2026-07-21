import type { ExtractedSubmission } from '../../shared/types/submission';

/**
 * Common interface for all coding platform adapters
 */
export interface IPlatformAdapter {
  /**
   * Unique identifier for the platform (e.g., 'leetcode', 'codeforces')
   */
  readonly id: string;
  
  /**
   * Display name for the platform (e.g., 'LeetCode', 'Codeforces')
   */
  readonly name: string;

  /**
   * Checks if the user is currently authenticated or connected to the platform
   */
  isConnected(): Promise<boolean>;

  /**
   * Fetches the logged-in user's username/handle on the platform
   */
  getUsername(): Promise<string>;

  /**
   * Fetches the details of a single submission by its ID
   */
  fetchSubmissionDetails(submissionId: string): Promise<ExtractedSubmission>;

  /**
   * Generator to fetch all past submissions for bulk syncing
   * Yields an array of ExtractedSubmissions per page/batch
   */
  fetchAllPastSubmissions(): AsyncGenerator<ExtractedSubmission[], void, unknown>;
}
