/**
 * Centralized API Client
 * 
 * Provides consistent API request handling with:
 * - Automatic auth header injection
 * - Standardized error handling
 * - Request/response interceptors
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
    
    // Request interceptors (array of functions)
    this.requestInterceptors = [];
    // Response interceptors (array of functions)
    this.responseInterceptors = [];
  }

  /**
   * Get authentication headers from localStorage
   */
  getAuthHeaders() {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Parse error response
   */
  async parseError(response) {
    try {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        return {
          message: errorData.error || errorData.message || `Server error: ${response.status}`,
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
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return await response.text();
  }

  /**
   * Apply request interceptors
   */
  async applyRequestInterceptors(config) {
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    return processedConfig;
  }

  /**
   * Apply response interceptors
   */
  async applyResponseInterceptors(response) {
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    return processedResponse;
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
    let config = {
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

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

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

      // Apply response interceptors
      const processedResponse = await this.applyResponseInterceptors(response);

      // Handle 401 globally (unless skipAuthRedirect is true)
      if (processedResponse.status === 401) {
        if (!skipAuthRedirect) {
          this.handleUnauthorized();
        }
        const error = await this.parseError(processedResponse);
        throw new ApiError("Unauthorized", 401, error.data);
      }

      // Handle other error statuses
      if (!processedResponse.ok) {
        const error = await this.parseError(processedResponse);
        throw new ApiError(error.message, processedResponse.status, error.data);
      }

      // Parse successful response
      return await this.parseResponse(processedResponse);
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

    let config = {
      ...restOptions,
      headers: requestHeaders,
    };

    if (body !== undefined) {
      config.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    config = await this.applyRequestInterceptors(config);

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

      const processedResponse = await this.applyResponseInterceptors(response);

      if (processedResponse.status === 401) {
        const { skipAuthRedirect = false } = options;
        if (!skipAuthRedirect) {
          this.handleUnauthorized();
        }
        const error = await this.parseError(processedResponse);
        throw new ApiError("Unauthorized", 401, error.data);
      }

      if (!processedResponse.ok) {
        const error = await this.parseError(processedResponse);
        throw new ApiError(error.message, processedResponse.status, error.data);
      }

      // Return Response object for streaming
      return processedResponse;
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

