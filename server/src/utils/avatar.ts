import crypto from 'crypto';

/**
 * Generates an MD5 hash of the email address for Gravatar
 * @param email The email address to hash
 * @returns MD5 hash of the email
 */
function generateGravatarHash(email: string): string {
  return crypto
    .createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex');
}

/**
 * Generates a Gravatar URL for the given email
 * @param email User's email address
 * @param size Size of the avatar in pixels
 * @returns Gravatar URL with 404 fallback
 */
function getGravatarUrl(email: string, size: number = 200): string {
  const hash = generateGravatarHash(email);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404&r=r`;
}

/**
 * Generates a Dicebear URL as fallback
 * @param username Username to use as seed
 * @returns Dicebear URL
 */
function getDicebearUrl(username: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

/**
 * Checks if a Gravatar exists for the given email
 * @param email User's email address
 * @returns true if Gravatar exists, false otherwise
 */
async function checkGravatarExists(email: string): Promise<boolean> {
  const gravatarUrl = getGravatarUrl(email);
  try {
    const response = await fetch(gravatarUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('[Avatar Service] Failed to check Gravatar:', error);
    return false;
  }
}

/**
 * Gets the avatar URL for a user, checking Gravatar first and falling back to Dicebear
 * @param email User's email address
 * @param username Username for Dicebear fallback
 * @returns Avatar URL
 */
export async function getAvatarUrl(email: string, username: string): Promise<string> {
  const hasGravatar = await checkGravatarExists(email);
  if (hasGravatar) {
    return getGravatarUrl(email);
  }
  return getDicebearUrl(username);
} 