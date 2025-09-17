// Simple token tracking system
const tokenUsage = new Map<string, { accessed: boolean, used: boolean, timestamp: number }>();

export function markTokenAccessed(tokenId: string): void {
  const existing = tokenUsage.get(tokenId);
  if (existing) {
    existing.accessed = true;
    existing.timestamp = Date.now();
  } else {
    tokenUsage.set(tokenId, { accessed: true, used: false, timestamp: Date.now() });
  }
  console.log(`Token ${tokenId} marked as accessed`);
}

export function markTokenUsed(tokenId: string): void {
  const existing = tokenUsage.get(tokenId);
  if (existing) {
    existing.used = true;
    existing.timestamp = Date.now();
  } else {
    tokenUsage.set(tokenId, { accessed: true, used: true, timestamp: Date.now() });
  }
  console.log(`Token ${tokenId} marked as used`);
}

export function isTokenAccessed(tokenId: string): boolean {
  const token = tokenUsage.get(tokenId);
  return token ? token.accessed : false;
}

export function isTokenUsed(tokenId: string): boolean {
  const token = tokenUsage.get(tokenId);
  return token ? token.used : false;
}

export function getTokenStatus(tokenId: string): { accessed: boolean; used: boolean } | null {
  const token = tokenUsage.get(tokenId);
  return token ? { accessed: token.accessed, used: token.used } : null;
}

// Clean old tokens (older than 1 hour)
export function cleanOldTokens(): void {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [tokenId, token] of tokenUsage.entries()) {
    if (token.timestamp < oneHourAgo) {
      tokenUsage.delete(tokenId);
    }
  }
}