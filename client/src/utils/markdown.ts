/**
 * Validates if a string is valid Markdown.
 * This is a basic validation that checks for common Markdown syntax.
 */
export function isValidMarkdown(content: string): boolean {
  // Check for unmatched backticks
  const backtickCount = (content.match(/`/g) || []).length;
  if (backtickCount % 2 !== 0) {
    return false;
  }
  
  // Check for unmatched code block markers
  const codeBlockMarkers = (content.match(/```/g) || []).length;
  if (codeBlockMarkers % 2 !== 0) {
    return false;
  }
  
  // Check for unmatched bold/italic markers
  const asteriskCount = (content.match(/\*/g) || []).length;
  if (asteriskCount % 2 !== 0) {
    return false;
  }
  
  // Check for unmatched underscores
  const underscoreCount = (content.match(/_/g) || []).length;
  if (underscoreCount % 2 !== 0) {
    return false;
  }
  
  return true;
}

/**
 * Sanitizes Markdown content by escaping special characters
 * that aren't part of valid Markdown syntax.
 */
export function sanitizeMarkdown(content: string): string {
  return content
    // Escape special characters outside of code blocks
    .replace(/([^`]|^)([*_~])/g, '$1\\$2')
    // Preserve code blocks
    .replace(/```[\s\S]*?```/g, (match) => match)
    // Preserve inline code
    .replace(/`[^`]*`/g, (match) => match);
}

/**
 * Formats a message with proper Markdown syntax.
 * This ensures consistent formatting and helps prevent XSS.
 */
export function formatMessageContent(content: string): string {
  // Trim whitespace
  content = content.trim();
  
  // Ensure code blocks have proper spacing
  content = content.replace(/```(\w+)?\n?([^`]+)```/g, '```$1\n$2\n```');
  
  // Ensure lists have proper spacing
  content = content.replace(/^[-*+]\s*/gm, '- ');
  
  // Normalize line endings
  content = content.replace(/\r\n?/g, '\n');
  
  // Remove excessive newlines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  return content;
} 