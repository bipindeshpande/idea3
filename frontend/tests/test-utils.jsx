/**
 * Test Utilities - Reusable helpers for testing
 * 
 * Provides common patterns for finding elements, waiting for conditions,
 * and handling async operations in tests.
 */

import { waitFor } from '@testing-library/react'
import { screen } from '@testing-library/react'

/**
 * Find form inputs with multiple fallback strategies
 * @param {HTMLElement} container - Container element to search within
 * @param {Object} options - Options for finding inputs
 * @returns {Object} Object with emailInput, passwordInputs, etc.
 */
export async function findFormInputs(container, options = {}) {
  const {
    emailPlaceholder = 'your@email.com',
    passwordPlaceholders = ['At least 8 characters', 'Confirm your password'],
    timeout = 5000,
  } = options

  // Wait for form to be in DOM
  await waitFor(() => {
    const form = container?.querySelector('form') || screen.queryByRole('form')
    expect(form).toBeInTheDocument()
  }, { timeout })

  // Find email input - try multiple strategies
  let emailInput = container?.querySelector('input[type="email"]')
  if (!emailInput) {
    emailInput = screen.queryByPlaceholderText(emailPlaceholder)
  }
  if (!emailInput) {
    emailInput = screen.queryByRole('textbox', { name: /email/i })
  }

  // Find password inputs - try multiple strategies
  let passwordInputs = container?.querySelectorAll('input[type="password"]')
  if (!passwordInputs || passwordInputs.length === 0) {
    // Try finding by placeholder
    passwordInputs = passwordPlaceholders
      .map(placeholder => screen.queryByPlaceholderText(placeholder))
      .filter(Boolean)
  }

  return {
    emailInput,
    passwordInputs: Array.from(passwordInputs || []),
    getPasswordInput: (index = 0) => passwordInputs[index] || passwordInputs[0],
    getConfirmPasswordInput: () => passwordInputs[1] || passwordInputs[0],
  }
}

/**
 * Wait for error message with flexible text matching
 * @param {string|RegExp|Function} matcher - Text to match (string, regex, or function)
 * @param {Object} options - Options for waiting
 * @returns {Promise<HTMLElement>} The error element
 */
export async function waitForError(matcher, options = {}) {
  const { timeout = 3000, container } = options

  return waitFor(() => {
    let errorElement

    if (typeof matcher === 'function') {
      // Custom matcher function - pass directly to getByText
      errorElement = screen.getByText(matcher)
    } else if (matcher instanceof RegExp) {
      // Regex matcher
      errorElement = screen.getByText(matcher)
    } else {
      // String matcher - use flexible matching with function
      const searchText = typeof matcher === 'string' ? matcher.toLowerCase() : String(matcher).toLowerCase()
      // Create a proper matcher function
      const matcherFn = (content, element) => {
        const text = element?.textContent?.toLowerCase() || ''
        return text.includes(searchText)
      }
      errorElement = screen.getByText(matcherFn)
    }

    expect(errorElement).toBeInTheDocument()
    return errorElement
  }, { timeout })
}

/**
 * Find password inputs with multiple strategies
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Options
 * @returns {Promise<NodeList|Array>} Password input elements
 */
export async function findPasswordInputs(container, options = {}) {
  const { timeout = 5000, minCount = 1 } = options

  await waitFor(() => {
    const inputs = container?.querySelectorAll('input[type="password"]') || []
    expect(inputs.length).toBeGreaterThanOrEqual(minCount)
  }, { timeout })

  return container?.querySelectorAll('input[type="password"]') || []
}

/**
 * Wait for form to be ready and inputs to be available
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Options
 */
export async function waitForFormReady(container, options = {}) {
  const { timeout = 5000 } = options

  await waitFor(() => {
    const form = container?.querySelector('form') || screen.queryByRole('form')
    expect(form).toBeInTheDocument()

    // Check that at least one input is present
    const inputs = container?.querySelectorAll('input') || []
    expect(inputs.length).toBeGreaterThan(0)
  }, { timeout })
}

/**
 * Find element by test ID with fallback
 * @param {string} testId - Test ID to find
 * @param {HTMLElement} container - Container to search within
 * @returns {HTMLElement|null} Found element or null
 */
export function findByTestId(testId, container = null) {
  if (container) {
    return container.querySelector(`[data-testid="${testId}"]`)
  }
  return screen.queryByTestId(testId)
}

/**
 * Wait for text to appear with flexible matching
 * @param {string|RegExp|Function} matcher - Text matcher
 * @param {Object} options - Options
 * @returns {Promise<HTMLElement>} Found element
 */
export async function waitForText(matcher, options = {}) {
  const { timeout = 3000 } = options

  return waitFor(() => {
    let element

    if (typeof matcher === 'function') {
      element = screen.getByText(matcher)
    } else if (matcher instanceof RegExp) {
      element = screen.getByText(matcher)
    } else {
      element = screen.getByText((content, el) => {
        const text = el?.textContent?.toLowerCase() || ''
        return text.includes(matcher.toLowerCase())
      })
    }

    expect(element).toBeInTheDocument()
    return element
  }, { timeout })
}

