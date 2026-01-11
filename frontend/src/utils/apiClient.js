/**
 * Centralized API Client
 * 
 * Provides consistent API request handling with:
 * - Automatic auth header injection
 * - Standardized error handling
 * - Timeout management
 * - Global 401 handling
 */

const SESSION_TOKEN_KEY = "sia_session_token";
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Centralized API Client
 */
class ApiClient {
  constructor() {
    this.baseURL = "/api";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * Get authentication headers from localStorage
   */
  getAuthHeaders() {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Parse error response
   */
  async parseError(response) {
    try {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        // FastAPI uses 'detail' for HTTPException, also check 'error' and 'message'
        const errorMessage = errorData.detail || errorData.error || errorData.message || `Server error: ${response.status}`;
        return {
          message: errorMessage,
          data: errorData,
        };
      } catch {
        return {
          message: errorText || `Server error: ${response.status}`,
          data: { raw: errorText },
        };
      }
    } catch {
      return {
        message: `Server error: ${response.status}`,
        data: null,
      };
    }
  }

  /**
   * Parse successful response
   */
  async parseResponse(response) {
    // Handle 204 No Content (common for DELETE requests)
    if (response.status === 204 || response.status === 201) {
      return null;
    }
    
    // Check if response has content
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return null;
    }
    
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch (e) {
        // If JSON parsing fails, return null for empty responses
        if (response.status === 204) {
          return null;
        }
        throw e;
      }
    }
    
    // Try to get text, but handle empty responses
    try {
      const text = await response.text();
      return text || null;
    } catch (e) {
      // If text parsing fails and it's a 204, that's expected
      if (response.status === 204) {
        return null;
      }
      throw e;
    }
  }

  /**
   * Handle 401 Unauthorized globally
   */
  handleUnauthorized() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    // Only redirect if not already on login page
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
  }

  /**
   * Core request method
   */
  async request(url, options = {}) {
    const {
      timeout = DEFAULT_TIMEOUT,
      headers = {},
      body,
      signal,
      skipAuthRedirect = false, // Option to skip automatic redirect on 401
      ...restOptions
    } = options;

    // Build headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...headers,
    };

    // Prepare config
    const config = {
      ...restOptions,
      headers: requestHeaders,
    };

    // Add body if provided
    if (body !== undefined) {
      if (typeof body === "string") {
        config.body = body;
      } else if (body instanceof FormData) {
        config.body = body;
        // Remove Content-Type for FormData (browser will set it with boundary)
        delete config.headers["Content-Type"];
      } else {
        config.body = JSON.stringify(body);
      }
    }

    // Setup timeout with AbortController
    const controller = new AbortController();
    const abortSignal = signal || controller.signal;
    let timeoutId = null;

    if (timeout > 0 && !signal) {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...config,
        signal: abortSignal,
      });

      // Handle 401 globally (unless skipAuthRedirect is true)
      if (response.status === 401) {
        if (!skipAuthRedirect) {
          this.handleUnauthorized();
        }
        const error = await this.parseError(response);
        // Use the actual error message from the backend instead of hardcoding "Unauthorized"
        throw new ApiError(error.message || "Unauthorized", 401, error.data);
      }

      // Handle other error statuses
      if (!response.ok) {
        const error = await this.parseError(response);
        throw new ApiError(error.message, response.status, error.data);
      }

      // Parse successful response
      return await this.parseResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }

      if (error.message) {
        throw new ApiError(error.message, 0);
      }

      throw new ApiError("Network error", 0);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.request(url, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: data,
    });
  }

  /**
   * PUT request
   */
  async put(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: data,
    });
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.request(url, {
      ...options,
      method: "DELETE",
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: "PATCH",
      body: data,
    });
  }

  /**
   * Streaming request (returns Response object, not parsed data)
   * Use this for SSE or other streaming responses
   */
  async stream(url, options = {}) {
    const {
      timeout = 300000, // 5 minutes for streaming
      headers = {},
      body,
      signal,
      ...restOptions
    } = options;

    const requestHeaders = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...headers,
    };

    const config = {
      ...restOptions,
      headers: requestHeaders,
    };

    if (body !== undefined) {
      config.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const controller = new AbortController();
    const abortSignal = signal || controller.signal;
    let timeoutId = null;

    if (timeout > 0 && !signal) {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);
    }

    try {
      // 🔍 DEBUG: Log final request details before sending
      console.group('🚀 API Stream Request Details');
      console.log('Full URL:', `${this.baseURL}${url}`);
      console.log('Method:', config.method || 'GET');
      console.log('Headers:', config.headers);
      console.log('Body (raw string):', config.body);
      if (config.body) {
        try {
          console.log('Body (parsed JSON):', JSON.parse(config.body));
        } catch (e) {
          console.log('Body (not JSON):', config.body);
        }
      }
      console.log('Signal:', abortSignal ? 'AbortSignal present' : 'No signal');
      console.log('Timeout:', timeout + 'ms');
      console.groupEnd();

      const response = await fetch(`${this.baseURL}${url}`, {
        ...config,
        signal: abortSignal,
      });

      if (response.status === 401) {
        const { skipAuthRedirect = false } = options;
        if (!skipAuthRedirect) {
          this.handleUnauthorized();
        }
        const error = await this.parseError(response);
        // Use the actual error message from the backend instead of hardcoding "Unauthorized"
        throw new ApiError(error.message || "Unauthorized", 401, error.data);
      }

      if (!response.ok) {
        const error = await this.parseError(response);
        throw new ApiError(error.message, response.status, error.data);
      }

      // Return Response object for streaming
      return response;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }

      throw new ApiError(error.message || "Network error", 0);
    }
  }
}

// Export singleton instance
export default new ApiClient();

