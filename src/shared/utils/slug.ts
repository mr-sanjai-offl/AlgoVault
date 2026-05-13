export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function topicSlug(tag: string): string {
  return slugify(tag);
}

export function problemSlug(title: string): string {
  return slugify(title);
}
