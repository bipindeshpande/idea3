import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Register from '../../../src/pages/auth/Register'
import { AuthProvider } from '../../../src/context/AuthContext'
import { ThemeProvider } from '../../../src/context/ThemeContext'
import { createFetchResponse } from '../../setup.jsx'
import { findFormInputs, waitForError, waitForFormReady } from '../../test-utils.jsx'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

global.fetch = vi.fn()

const renderWithRouter = (component) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            {component}
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockNavigate.mockClear()
  })

  it('should render registration form', async () => {
    const { container } = renderWithRouter(<Register />)

    // Use getAllByText and check the heading specifically
    const headings = screen.getAllByText('Create Account')
    expect(headings.length).toBeGreaterThan(0)
    
    // Wait for form to be ready
    await waitForFormReady(container)
    
    // Find inputs using utility
    const { emailInput, passwordInputs } = await findFormInputs(container)
    
    expect(emailInput).toBeTruthy()
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/3 days free trial/i)).toBeInTheDocument()
  })

  it('should show error when fields are empty', async () => {
    const user = userEvent.setup()
    const { container } = renderWithRouter(<Register />)

    // Wait for form to be ready
    await waitForFormReady(container)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    // Wait for error to appear using test ID
    await waitFor(() => {
      const errorElement = screen.queryByTestId('register-error')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement?.textContent?.toLowerCase()).toContain('all fields are required')
    }, { timeout: 3000 })
  })

  it('should show error when password is too short', async () => {
    const user = userEvent.setup()
    const { container } = renderWithRouter(<Register />)

    // Wait for form and find inputs using test IDs
    await waitForFormReady(container)
    const emailInput = screen.queryByTestId('register-email-input') || screen.getByLabelText('Email')
    const passwordInput = screen.queryByTestId('register-password-input') || container.querySelector('input[type="password"]')
    const confirmPasswordInput = screen.queryByTestId('register-confirm-password-input') || container.querySelectorAll('input[type="password"]')[1] || passwordInput
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'short')
    if (confirmPasswordInput !== passwordInput) {
      await user.type(confirmPasswordInput, 'short')
    }
    await user.click(submitButton)

    // Wait for error to appear
    await waitFor(() => {
      const errorElement = screen.queryByTestId('register-error')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement?.textContent?.toLowerCase()).toContain('password must be at least 8')
    }, { timeout: 3000 })
  })

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup()
    const { container } = renderWithRouter(<Register />)

    // Wait for form and find inputs using test IDs
    await waitForFormReady(container)
    const emailInput = screen.queryByTestId('register-email-input') || screen.getByLabelText('Email')
    const passwordInput = screen.queryByTestId('register-password-input') || container.querySelector('input[type="password"]')
    const confirmPasswordInput = screen.queryByTestId('register-confirm-password-input') || container.querySelectorAll('input[type="password"]')[1] || passwordInput
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    if (confirmPasswordInput !== passwordInput) {
      await user.type(confirmPasswordInput, 'differentpassword')
    }
    await user.click(submitButton)

    // Wait for error to appear
    await waitFor(() => {
      const errorElement = screen.queryByTestId('register-error')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement?.textContent?.toLowerCase()).toContain('passwords do not match')
    }, { timeout: 3000 })
  })

  it('should show error when registration fails', async () => {
    const user = userEvent.setup()

    // Mock auth check endpoint
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: null,
      })
    )

    // Mock subscription status endpoint
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock register endpoint - failure
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: false,
        error: 'Email already exists',
      }, { status: 400 })
    )

    const { container } = renderWithRouter(<Register />)

    // Wait for form and find inputs using test IDs
    await waitForFormReady(container)
    const emailInput = screen.queryByTestId('register-email-input') || screen.getByLabelText('Email')
    const passwordInput = screen.queryByTestId('register-password-input') || container.querySelector('input[type="password"]')
    const confirmPasswordInput = screen.queryByTestId('register-confirm-password-input') || container.querySelectorAll('input[type="password"]')[1] || passwordInput
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')
    if (confirmPasswordInput !== passwordInput) {
      await user.type(confirmPasswordInput, 'password123')
    }
    await user.click(submitButton)

    // Wait for error to appear
    await waitFor(() => {
      const errorElement = screen.queryByTestId('register-error')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement?.textContent?.toLowerCase()).toContain('email already exists')
    }, { timeout: 3000 })
  })

  it('should navigate to dashboard on successful registration', async () => {
    const user = userEvent.setup()
    const mockUser = { user_id: '123', email: 'test@example.com' }
    const mockToken = 'test-token'

    // Mock auth check endpoint
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: null,
      })
    )

    // Mock subscription status endpoint
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock register endpoint - success
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        session_token: mockToken,
        user: mockUser,
      })
    )

    // Mock subscription status endpoint (called after registration)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock auth check endpoint (called after registration)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: mockUser,
      })
    )

    const { container } = renderWithRouter(<Register />)

    // Wait for form and find inputs using test IDs
    await waitForFormReady(container)
    const emailInput = screen.queryByTestId('register-email-input') || screen.getByLabelText('Email')
    const passwordInput = screen.queryByTestId('register-password-input') || container.querySelector('input[type="password"]')
    const confirmPasswordInput = screen.queryByTestId('register-confirm-password-input') || container.querySelectorAll('input[type="password"]')[1] || passwordInput
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    if (confirmPasswordInput !== passwordInput) {
      await user.type(confirmPasswordInput, 'password123')
    }
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 3000 })
  })

  it('should show loading state during registration', async () => {
    const user = userEvent.setup()

    // Mock auth check endpoint
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: null,
      })
    )

    // Mock subscription status endpoint
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock register endpoint with delay
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve(
        createFetchResponse({
          success: true,
          session_token: 'test-token',
          user: { user_id: '123', email: 'test@example.com' },
        })
      ), 100))
    )

    const { container } = renderWithRouter(<Register />)

    // Wait for form and find inputs using test IDs
    await waitForFormReady(container)
    const emailInput = screen.queryByTestId('register-email-input') || screen.getByLabelText('Email')
    const passwordInput = screen.queryByTestId('register-password-input') || container.querySelector('input[type="password"]')
    const confirmPasswordInput = screen.queryByTestId('register-confirm-password-input') || container.querySelectorAll('input[type="password"]')[1] || passwordInput
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    if (confirmPasswordInput !== passwordInput) {
      await user.type(confirmPasswordInput, 'password123')
    }
    await user.click(submitButton)

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    expect(submitButton).toBeDisabled()
  })
})

