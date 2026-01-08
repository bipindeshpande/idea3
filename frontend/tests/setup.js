import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { HelmetProvider } from 'react-helmet-async'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock localStorage with actual storage-like behavior
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Helper function to create proper fetch mock responses
export function createFetchResponse(data, options = {}) {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    headers = { 'content-type': 'application/json' },
  } = options

  return {
    ok,
    status,
    statusText,
    headers: new Headers(headers),
    json: async () => data,
    text: async () => JSON.stringify(data),
  }
}

// Helper to wrap components with HelmetProvider
export function withHelmetProvider(component) {
  return <HelmetProvider>{component}</HelmetProvider>
}

