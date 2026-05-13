import { LANGUAGE_EXTENSIONS, LANGUAGE_FOLDER_NAMES, SOLUTION_FILE_NAMES } from '../constants';

export function getFileExtension(language: string): string {
  const key = language.toLowerCase();
  return LANGUAGE_EXTENSIONS[key] ?? '.txt';
}

export function getLanguageFolder(language: string): string {
  const key = language.toLowerCase();
  return LANGUAGE_FOLDER_NAMES[key] ?? key;
}

export function getSolutionFileName(language: string): string {
  const key = language.toLowerCase();
  return SOLUTION_FILE_NAMES[key] ?? `solution${getFileExtension(language)}`;
}
