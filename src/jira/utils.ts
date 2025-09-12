// ...existing code...
// TypeScript translation of utils.js
export function mapNameToId(
  name: string,
  mapping: Record<string, string>
): string | undefined {
  return mapping[name];
}

export function handleError(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`Error in ${context}:`, error);
  } else {
    console.error(`Error in ${context}:`, error);
  }
}
// ...existing code...
