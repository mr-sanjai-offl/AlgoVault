import { describe, it, expect } from 'vitest';
import { slugify, topicSlug, problemSlug } from '@shared/utils/slug';

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Two Sum')).toBe('two-sum');
  });

  it('handles special characters', () => {
    expect(slugify("Merge k Sorted Lists")).toBe('merge-k-sorted-lists');
  });

  it('removes leading/trailing hyphens', () => {
    expect(slugify(' -test- ')).toBe('test');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('lowercases everything', () => {
    expect(slugify('Binary Search')).toBe('binary-search');
  });

  it('handles numbers', () => {
    expect(slugify('3Sum Closest')).toBe('3sum-closest');
  });
});

describe('topicSlug', () => {
  it('slugifies topic tags', () => {
    expect(topicSlug('Dynamic Programming')).toBe('dynamic-programming');
    expect(topicSlug('Two Pointers')).toBe('two-pointers');
    expect(topicSlug('Array')).toBe('array');
  });
});

describe('problemSlug', () => {
  it('slugifies problem titles', () => {
    expect(problemSlug('Two Sum')).toBe('two-sum');
    expect(problemSlug('Add Two Numbers')).toBe('add-two-numbers');
  });
});
