import { describe, it, expect } from 'vitest';
import { getFileExtension, getLanguageFolder, getSolutionFileName } from '@shared/utils/fileExtMap';

describe('getFileExtension', () => {
  it('returns .py for python', () => {
    expect(getFileExtension('python')).toBe('.py');
    expect(getFileExtension('Python')).toBe('.py');
    expect(getFileExtension('python3')).toBe('.py');
  });

  it('returns .java for java', () => {
    expect(getFileExtension('java')).toBe('.java');
    expect(getFileExtension('Java')).toBe('.java');
  });

  it('returns .cpp for c++', () => {
    expect(getFileExtension('c++')).toBe('.cpp');
    expect(getFileExtension('cpp')).toBe('.cpp');
  });

  it('returns .js for javascript', () => {
    expect(getFileExtension('javascript')).toBe('.js');
  });

  it('returns .txt for unknown', () => {
    expect(getFileExtension('brainfuck')).toBe('.txt');
  });
});

describe('getLanguageFolder', () => {
  it('returns correct folder names', () => {
    expect(getLanguageFolder('python')).toBe('python');
    expect(getLanguageFolder('c++')).toBe('cpp');
    expect(getLanguageFolder('javascript')).toBe('javascript');
  });
});

describe('getSolutionFileName', () => {
  it('returns Solution.java for java', () => {
    expect(getSolutionFileName('java')).toBe('Solution.java');
  });

  it('returns solution.py for python', () => {
    expect(getSolutionFileName('python')).toBe('solution.py');
  });
});
