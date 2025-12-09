/**
 * Discovery API helper with streaming support using Server-Sent Events (SSE)
 */

/**
 * Run discovery with streaming support using EventSource (SSE)
 * @param {Object} payload - The discovery input payload
 * @param {Function} onChunk - Callback called for each text chunk received
 * @param {Function} onComplete - Callback called when streaming completes with metadata
 * @param {Function} onError - Callback called on error
 * @param {Object} options - Additional options (timeout, etc.)
 * @returns {Promise<void>}
 */
export async function runDiscovery(payload, onChunk, onComplete, onError, options = {}) {
  const { timeout = 300000, useSSE = true } = options; // 5 minute default timeout
  
  // For SSE, we need to use POST with EventSource-like behavior
  // Since EventSource only supports GET, we'll use fetch with streaming for SSE format
  if (useSSE) {
    return runDiscoverySSE(payload, onChunk, onComplete, onError, timeout);
  } else {
    return runDiscoveryPlain(payload, onChunk, onComplete, onError, timeout);
  }
}

/**
 * Filter out JSON metadata that might have leaked into content chunks
 * Removes patterns like {"run_id": "...", "status": "..."} from text
 * IMPORTANT: Does NOT filter profile analysis JSON delimiters
 */
function filterOutJSONMetadata(text) {
  if (!text) return text;
  
  // PROTECT: Don't filter if this contains profile analysis delimiters
  // Profile analysis JSON should be preserved intact
  if (text.includes("---PROFILE_ANALYSIS_START---") || 
      text.includes("---PROFILE_ANALYSIS_END---")) {
    // This is profile analysis JSON - don't filter it
    return text;
  }
  
  // Remove JSON objects that look like SSE metadata
  // Pattern: {"run_id": "...", "status": "..."} optionally followed by punctuation
  // More flexible pattern that handles various JSON formats
  const jsonPattern = /\{[^{}]*"run_id"\s*:\s*"[^"]*"[^{}]*"status"\s*:\s*"[^"]*"[^{}]*\}[-\s]*/g;
  let filtered = text.replace(jsonPattern, "");
  
  // Also remove standalone JSON-like objects with run_id (more flexible)
  const runIdPattern = /\{[^{}]*"run_id"\s*:\s*"[^"]*"[^{}]*\}[-\s]*/g;
  filtered = filtered.replace(runIdPattern, "");
  
  // Remove any remaining JSON-like patterns that start with { and contain run_id
  const loosePattern = /\{[^{}]*run_id[^{}]*\}[-\s]*/g;
  filtered = filtered.replace(loosePattern, "");
  
  return filtered.trim();
}

/**
 * Run discovery using Server-Sent Events format
 */
async function runDiscoverySSE(payload, onChunk, onComplete, onError, timeout) {
  let runId = null;
  let cached = false;
  let fullData = "";
  let timeoutId = null;
  let aborted = false;

  try {
    const controller = new AbortController();
    
    // Set timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        aborted = true;
        controller.abort();
        if (onError) {
          onError(new Error("Request timeout: Discovery took too long to complete"));
        }
      }, timeout);
    }

    const response = await fetch("/api/discovery?format=sse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Server error");
      throw new Error(errorText || `Server error: ${response.status}`);
    }

    // Check for cached response
    const cachedHeader = response.headers.get("X-Cached");
    cached = cachedHeader === "true";
    
    // Get run_id from headers
    const runIdHeader = response.headers.get("X-Run-Id");
    if (runIdHeader) {
      runId = runIdHeader;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Helper function to process SSE events
    const processSSEEvent = (eventType, data) => {
      if (!data) return;

      try {
        if (eventType === "start" || eventType === "cached" || eventType === "end" || eventType === "error") {
          // These events have JSON data
          const parsed = JSON.parse(data);
          
          if (eventType === "start") {
            runId = parsed.run_id || runId;
          } else if (eventType === "cached") {
            cached = true;
            runId = parsed.run_id || runId;
          } else if (eventType === "error") {
            throw new Error(parsed.error || "Unknown error");
          } else if (eventType === "end") {
            runId = parsed.run_id || runId;
            if (timeoutId) clearTimeout(timeoutId);
            
            if (onComplete) {
              onComplete({
                runId,
                cached,
                fullData,
                status: parsed.status || "completed"
              });
            }
          }
        } else {
          // Chunk event or no event type = plain text data
          // Filter out JSON metadata that might have leaked into chunks
          const filteredData = filterOutJSONMetadata(data);
          if (filteredData) {
            fullData += filteredData;
            if (onChunk) {
              onChunk(filteredData);
            }
          }
        }
      } catch (e) {
        // If JSON parse fails, check if it's JSON metadata that should be filtered
        const filteredData = filterOutJSONMetadata(data);
        if (filteredData) {
          fullData += filteredData;
          if (onChunk) {
            onChunk(filteredData);
          }
        }
      }
    };

    while (true) {
      if (aborted) break;

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Parse SSE format: "event: type\ndata: {...}\n\n"
      // SSE allows multiple "data:" lines which are joined with \n
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      let currentEvent = null;
      const dataLines = [];

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          // Process previous event if we have data
          if (dataLines.length > 0) {
            processSSEEvent(currentEvent, dataLines.join("\n"));
            dataLines.length = 0;
          }
          currentEvent = line.substring(7).trim();
        } else if (line.startsWith("data: ")) {
          dataLines.push(line.substring(6)); // Remove "data: " prefix
        } else if (line === "" && (currentEvent || dataLines.length > 0)) {
          // End of event (empty line)
          const data = dataLines.join("\n");
          processSSEEvent(currentEvent, data);
          currentEvent = null;
          dataLines.length = 0;
        }
      }
    }

    // If we exit the loop without an "end" event, complete anyway
    if (timeoutId) clearTimeout(timeoutId);
    if (onComplete) {
      onComplete({
        runId,
        cached,
        fullData,
        status: "completed"
      });
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    
    if (error.name === "AbortError") {
      if (onError) {
        onError(new Error("Request was cancelled or timed out"));
      }
    } else {
      if (onError) {
        onError(error);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Run discovery using plain text format (fallback)
 */
async function runDiscoveryPlain(payload, onChunk, onComplete, onError, timeout) {
  let runId = null;
  let cached = false;
  let fullData = "";
  let timeoutId = null;

  try {
    const controller = new AbortController();
    
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        controller.abort();
        if (onError) {
          onError(new Error("Request timeout"));
        }
      }, timeout);
    }

    const response = await fetch("/api/discovery?format=plain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Server error");
      throw new Error(errorText || `Server error: ${response.status}`);
    }

    // Check for cached response
    cached = response.headers.get("X-Cached") === "true";
    runId = response.headers.get("X-Run-Id");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullData += chunk;

      if (onChunk) {
        onChunk(chunk);
      }
    }

    if (timeoutId) clearTimeout(timeoutId);
    
    if (onComplete) {
      onComplete({
        runId,
        cached,
        fullData,
        status: "completed"
      });
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
  }
}

