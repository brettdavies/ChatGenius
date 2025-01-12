/**
 * Utility functions for handling date transformations
 */

/**
 * Transforms a date string or Date object into a Date object.
 * If the input is already a Date object, it is returned as is.
 * If the input is a string, it is parsed into a Date object.
 * 
 * @param date The date string or Date object to transform
 * @returns A Date object
 */
export function transformDate(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
}

/**
 * Transforms an object's date fields from strings to Date objects.
 * Only transforms fields that end with 'At' (e.g., createdAt, updatedAt).
 * 
 * @param obj The object containing date fields
 * @returns A new object with transformed date fields
 */
export function transformDates<T extends Record<string, any>>(obj: T): T {
  const transformed = { ...obj };
  
  for (const [key, value] of Object.entries(obj)) {
    if (key.endsWith('At') && (typeof value === 'string' || value instanceof Date)) {
      (transformed as any)[key] = transformDate(value);
    }
  }
  
  return transformed;
} 