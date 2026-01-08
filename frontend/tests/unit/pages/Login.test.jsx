import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Login from '../../../src/pages/auth/Login'
import { AuthProvider } from '../../../src/context/AuthContext'
import { ThemeProvider } from '../../../src/context/ThemeContext'
import { createFetchResponse } from '../../setup.jsx'
import { findFormInputs, waitForError, waitForFormReady } from '../../test-utils.jsx'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

// Mock fetch
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

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockNavigate.mockClear()
  })

  it('should render login form', () => {
    const { container } = renderWithRouter(<Login />)

    // Check for "Sign In" heading - use getAllByText and check it exists
    const signInTexts = screen.getAllByText('Sign In')
    expect(signInTexts.length).toBeGreaterThan(0)
    
    // Check form elements
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    // Password input might not have accessible label, use container query as fallback
    const passwordInput = screen.queryByLabelText('Password') || container.querySelector('input[type="password"]')
    expect(passwordInput).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('should show error when email and password are empty', async () => {
    const user = userEvent.setup()
    const { container } = renderWithRouter(<Login />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Wait for error to appear using test ID
    await waitFor(() => {
      const errorElement = screen.queryByTestId('login-error')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement?.textContent?.toLowerCase()).toContain('email and password are required')
    }, { timeout: 3000 })
  })

  it('should show error when login fails', async () => {
    const user = userEvent.setup()
    
    // Mock auth check endpoint (called by AuthProvider)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: null,
      })
    )

    // Mock subscription status endpoint (called by AuthProvider)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock login endpoint - failure
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 })
    )

    const { container } = renderWithRouter(<Login />)

    // Wait for form and find inputs
    await waitForFormReady(container)
    const emailInput = screen.queryByTestId('login-email-input') || screen.getByLabelText('Email')
    const passwordInput = screen.queryByTestId('login-password-input') || container.querySelector('input[type="password"]')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    // Wait for error to appear
    await waitFor(() => {
      const errorElement = screen.queryByTestId('login-error')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement?.textContent?.toLowerCase()).toContain('invalid credentials')
    }, { timeout: 3000 })
  })

  it('should navigate to dashboard on successful login', async () => {
    const user = userEvent.setup()
    const mockUser = { user_id: '123', email: 'test@example.com' }
    const mockToken = 'test-token'

    // Mock auth check endpoint (called by AuthProvider)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: null,
      })
    )

    // Mock subscription status endpoint (called by AuthProvider)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock login endpoint - success
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        session_token: mockToken,
        user: mockUser,
      })
    )

    // Mock subscription status endpoint (called after login)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock auth check endpoint (called after login)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: mockUser,
      })
    )

    const { container } = renderWithRouter(<Login />)

    // Wait for form to be ready
    await waitForFormReady(container)
    const emailInput = screen.queryByTestId('login-email-input') || screen.getByLabelText('Email')
    const passwordInput = screen.queryByTestId('login-password-input') || container.querySelector('input[type="password"]')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 3000 })
  })

  it('should show loading state during login', async () => {
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

    // Mock login endpoint with delay
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve(
        createFetchResponse({
          success: true,
          session_token: 'test-token',
          user: { user_id: '123', email: 'test@example.com' },
        })
      ), 100))
    )

    const { container } = renderWithRouter(<Login />)

    // Wait for form to be ready
    await waitForFormReady(container)
    const emailInput = screen.queryByTestId('login-email-input') || screen.getByLabelText('Email')
    const passwordInput = screen.queryByTestId('login-password-input') || container.querySelector('input[type="password"]')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should have remember me checkbox', () => {
    renderWithRouter(<Login />)

    const rememberCheckbox = screen.getByLabelText(/remember me/i)
    expect(rememberCheckbox).toBeInTheDocument()
    expect(rememberCheckbox).toHaveAttribute('type', 'checkbox')
  })
})

