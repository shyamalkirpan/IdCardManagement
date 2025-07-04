import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Only use on the client side as DOMPurify requires a DOM environment
 */
export const sanitizeHtml = (dirty: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: basic HTML encoding
    return dirty
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  // Client-side: use DOMPurify for comprehensive sanitization
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed - pure text only
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitizes text input to prevent injection attacks
 * Removes potentially dangerous characters and sequences
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>&"']/g, '') // Remove HTML-dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .trim()
    .slice(0, 1000); // Limit length to prevent buffer overflow
};

/**
 * Validates and sanitizes user names
 */
export const sanitizeName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z\s.'-]/g, '') // Only allow letters, spaces, dots, apostrophes, hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 100); // Reasonable name length limit
};

/**
 * Validates and sanitizes addresses
 */
export const sanitizeAddress = (address: string): string => {
  return address
    .replace(/[<>&"']/g, '') // Remove HTML-dangerous characters
    .replace(/[^\w\s.,#-]/g, '') // Only allow word chars, spaces, and common address punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 500); // Reasonable address length limit
};

/**
 * Sanitizes contact numbers
 */
export const sanitizeContactNumber = (contact: string): string => {
  return contact
    .replace(/[^\d+\-\s()]/g, '') // Only allow digits, +, -, spaces, parentheses
    .trim()
    .slice(0, 20); // Reasonable phone number length
};

/**
 * Sanitizes admission numbers
 */
export const sanitizeAdmissionNumber = (admissionNo: string): string => {
  return admissionNo
    .replace(/[^A-Za-z0-9\-/]/g, '') // Only allow alphanumeric, hyphens, forward slashes
    .trim()
    .slice(0, 50); // Reasonable admission number length
};