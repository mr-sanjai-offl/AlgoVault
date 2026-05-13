export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeDedupKey(
  problemSlug: string,
  language: string,
  solutionCode: string,
): Promise<string> {
  return sha256(`${problemSlug}:${language}:${solutionCode}`);
}
