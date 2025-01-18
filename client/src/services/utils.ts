export async function handleResponse(response: Response) {
  if (!response.ok) {
    try {
      const error = await response.json();
      console.log('[API] Error response:', {
        status: response.status,
        error,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Handle OpenAPI error schema
      if (error.code && error.message) {
        throw new Error(`${error.code}: ${error.message}`);
      }
      
      // Handle array of errors
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        throw new Error(`${firstError.code}: ${firstError.message}`);
      }
      
      // Fallback
      throw new Error(error.message || `${response.status} ${response.statusText}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        // Response is not JSON
        console.error('[API] Non-JSON error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`${response.status} ${response.statusText}`);
      }
      throw e;
    }
  }

  // Return undefined for 204 No Content responses
  if (response.status === 204) {
    return undefined;
  }

  const data = await response.json();
  return data;
} 