/**
 * Discovery API helper with streaming support using Server-Sent Events (SSE)
 */
import { cleanStreamedText } from './parsers/index.js';
import { parseJSONLine, StreamAccumulator } from './parsers/streamParsers/parseJSONLines.js';
import apiClient from './apiClient.js';

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
 const { timeout = 300000, useSSE = true, signal = null } = options; // 5 minute default timeout
 
 // For SSE, we need to use POST with EventSource-like behavior
 // Since EventSource only supports GET, we'll use fetch with streaming for SSE format
 if (useSSE) {
 return runDiscoverySSE(payload, onChunk, onComplete, onError, timeout, signal);
 } else {
 return runDiscoveryPlain(payload, onChunk, onComplete, onError, timeout);
 }
}

/**
 * Run discovery using Server-Sent Events format
 */
async function runDiscoverySSE(payload, onChunk, onComplete, onError, timeout, signal = null) {
 let runId = null;
 let cached = false;
 let fullData = "";
 let accumulator = new StreamAccumulator();
 let timeoutId = null;
 let aborted = false;

 try {
 // Use provided signal or create new controller for timeout
 const controller = signal ? null : new AbortController();
 const abortSignal = signal || (controller ? controller.signal : undefined);
 
 // Set timeout only if we created our own controller
 if (timeout > 0 && controller) {
 timeoutId = setTimeout(() => {
 aborted = true;
 controller.abort();
 if (onError) {
 onError(new Error("Request timeout: Discovery took too long to complete"));
 }
 }, timeout);
 }

 // Use API client stream method for SSE
 const response = await apiClient.stream("/discovery?format=sse", {
 method: "POST",
 body: payload,
 timeout: timeout,
 signal: abortSignal,
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

 // Handle error events first - they should always trigger an error
 if (eventType === "error") {
 try {
 const parsed = JSON.parse(data);
 const errorMessage = parsed.error || "Unknown error";
 if (onError) {
 onError(new Error(errorMessage));
 } else {
 throw new Error(errorMessage);
 }
 } catch (parseError) {
 // If JSON parse fails, use the raw data as error message
 const errorMessage = data.includes("[ERROR]") ? data : `Discovery failed: ${data}`;
 if (onError) {
 onError(new Error(errorMessage));
 } else {
 throw new Error(errorMessage);
 }
 }
 return; // Don't process error events as regular data
 }

 try {
 if (eventType === "start" || eventType === "cached" || eventType === "end") {
 // These events have JSON data
 const parsed = JSON.parse(data);
 
 if (eventType === "start") {
 runId = parsed.run_id || runId;
 } else if (eventType === "cached") {
 cached = true;
 runId = parsed.run_id || runId;
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
 // Chunk event or no event type = structured JSON line data
 // Try to parse as JSON line first
 const chunkData = parseJSONLine(data);
 if (chunkData && chunkData.type) {
 // Valid JSON line chunk - validate and add to accumulator
 const result = accumulator.addChunk(chunkData, true);
 if (result.success) {
 fullData += data + "\n";
 
 // Extract text from validated chunk for display if it's a content chunk
 const validatedChunk = result.validatedChunk || chunkData;
 if (validatedChunk.type === "profile_chunk" || validatedChunk.type === "recommendation_chunk") {
 const text = validatedChunk.text || "";
 if (text && onChunk) {
 onChunk(text);
 }
 }
 } else {
 // Validation failed - log but continue
 console.warn("WARNING: Chunk validation failed:", result.error, "Chunk:", chunkData);
 fullData += data + "\n"; // Still add to fullData for debugging
 }
 } else {
 // Not a valid JSON line - might be old format or raw text
 // Try cleaning and using as-is for backward compatibility
 const filteredData = cleanStreamedText(data);
 if (filteredData) {
 fullData += filteredData;
 if (onChunk) {
 onChunk(filteredData);
 }
 }
 }
 }
 } catch (e) {
 // If JSON parse fails, check if it's JSON metadata that should be filtered
 // But also check if it contains error indicators
 if (data.includes("[ERROR]") || data.toLowerCase().includes("error")) {
 if (onError) {
 onError(new Error(data));
 } else {
 throw new Error(data);
 }
 } else {
 // Try parsing as JSON line
 const chunkData = parseJSONLine(data);
 if (chunkData && chunkData.type) {
 const result = accumulator.addChunk(chunkData, true);
 if (result.success) {
 fullData += data + "\n";
 
 const validatedChunk = result.validatedChunk || chunkData;
 if (validatedChunk.type === "profile_chunk" || validatedChunk.type === "recommendation_chunk") {
 const text = validatedChunk.text || "";
 if (text && onChunk) {
 onChunk(text);
 }
 }
 } else {
 console.warn("WARNING: Chunk validation failed in catch block:", result.error);
 fullData += data + "\n";
 }
 } else {
 const filteredData = cleanStreamedText(data);
 if (filteredData) {
 fullData += filteredData;
 if (onChunk) {
 onChunk(filteredData);
 }
 }
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
 // Process remaining buffer if any (handle incomplete JSON lines)
 if (buffer.trim()) {
 try {
 const chunkData = parseJSONLine(buffer);
 if (chunkData && chunkData.type) {
 const result = accumulator.addChunk(chunkData, true);
 if (result.success) {
 fullData += buffer + "\n";
 } else {
 console.warn("WARNING: Buffer chunk validation failed:", result.error);
 fullData += buffer; // Still add for debugging
 }
 } else {
 // Incomplete or invalid JSON - log but don't error
 console.warn("WARNING: Incomplete JSON line in buffer at end of stream:", buffer.substring(0, 100));
 // Still add to fullData for debugging
 fullData += buffer;
 }
 } catch (e) {
 // Invalid JSON in buffer - log but continue
 console.warn("WARNING: Failed to parse buffer at end of stream:", e, buffer.substring(0, 100));
 fullData += buffer;
 }
 }
 
 if (timeoutId) clearTimeout(timeoutId);
 if (onComplete) {
 onComplete({
 runId,
 cached,
 fullData,
 status: "completed",
 accumulator: accumulator  // Pass accumulator for structured parsing
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

 // Use API client stream method for plain text streaming
 const response = await apiClient.stream("/discovery?format=plain", {
 method: "POST",
 body: payload,
 timeout: timeout,
 signal: controller.signal,
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

