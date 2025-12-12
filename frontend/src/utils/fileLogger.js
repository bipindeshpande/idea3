/**
 * File logger utility for collecting frontend logs and downloading as mylog.log
 */

let logBuffer = [];
const MAX_BUFFER_SIZE = 10000; // Max lines to keep in memory

// Initialize with a startup message
logBuffer.push(`[${new Date().toISOString()}] [INFO] [FILE_LOGGER] File logger initialized`);

/**
 * Add a log entry to the buffer
 */
export function logToFile(message, level = "INFO", source = "FRONTEND") {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] [${source}] ${message}`;
  
  logBuffer.push(logEntry);
  
  // Keep buffer size manageable
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer = logBuffer.slice(-MAX_BUFFER_SIZE);
  }
  
  // Also log to console
  console.log(logEntry);
}

/**
 * Add a section with title and content to log buffer
 */
export function logSectionToFile(title, content, level = "DEBUG", source = "FRONTEND") {
  const timestamp = new Date().toISOString();
  const separator = "=".repeat(80);
  
  const logEntry = `\n${separator}\n[${timestamp}] [${level}] [${source}] ${title}\n${separator}\n${content}\n${separator}\n\n`;
  
  logBuffer.push(logEntry);
  
  // Keep buffer size manageable
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer = logBuffer.slice(-MAX_BUFFER_SIZE);
  }
  
  // Also log to console
  console.log(logEntry);
}

/**
 * Download all logs as mylog.log file
 */
export function downloadLogFile() {
  if (logBuffer.length === 0) {
    alert("No logs collected yet. Logs are collected as you interact with the page.");
    return;
  }
  
  const logContent = logBuffer.join("\n");
  const blob = new Blob([logContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mylog.log";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log(`Downloaded ${logBuffer.length} log entries as mylog.log`);
}

/**
 * Clear the log buffer
 */
export function clearLogBuffer() {
  logBuffer = [];
}

/**
 * Get current log buffer size
 */
export function getLogBufferSize() {
  return logBuffer.length;
}

// Override console.log to also log to file (optional, can be enabled)
let originalConsoleLog = console.log;
let originalConsoleWarn = console.warn;
let originalConsoleError = console.error;

export function enableAutoFileLogging() {
  console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    logToFile(args.join(" "), "INFO", "CONSOLE");
  };
  
  console.warn = function(...args) {
    originalConsoleWarn.apply(console, args);
    logToFile(args.join(" "), "WARN", "CONSOLE");
  };
  
  console.error = function(...args) {
    originalConsoleError.apply(console, args);
    logToFile(args.join(" "), "ERROR", "CONSOLE");
  };
}

export function disableAutoFileLogging() {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
}

