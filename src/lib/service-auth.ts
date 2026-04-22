/**
 * Service Authentication Utilities
 * Validates service API keys for external application access
 */

/**
 * Validate a service API key against configured keys
 * @param key - The service key from X-Service-Key header
 * @returns true if valid, false otherwise
 */
export function validateServiceKey(key: string | null): boolean {
  if (!key) {
    return false;
  }

  // Get service keys from environment
  const serviceKeys = process.env.SERVICE_API_KEYS;

  if (!serviceKeys) {
    console.error("SERVICE_API_KEYS not configured in environment");
    return false;
  }

  // Split by comma and trim whitespace
  const validKeys = serviceKeys.split(",").map((k) => k.trim());

  // Check if provided key exists in valid keys
  return validKeys.includes(key);
}

/**
 * Get masked version of service key for logging (shows only last 4 characters)
 * @param key - The service key
 * @returns Masked key string
 */
export function maskServiceKey(key: string): string {
  if (!key || key.length < 8) {
    return "****";
  }
  return `****${key.slice(-4)}`;
}
