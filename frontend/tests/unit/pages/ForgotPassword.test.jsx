import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import ForgotPassword from '../../../src/pages/auth/ForgotPassword'
import { AuthProvider } from '../../../src/context/AuthContext'
import { ThemeProvider } from '../../../src/context/ThemeContext'
import { createFetchResponse } from '../../setup.jsx'
import { waitForError, waitForText, waitForFormReady } from '../../test-utils.jsx'

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

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render forgot password form', () => {
    renderWithRouter(<ForgotPassword />)

    expect(screen.getByText('Forgot Password')).toBeInTheDocument()
    expect(screen.getByText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('should show error when email is empty', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ForgotPassword />)

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('should show error when request fails', async () => {
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

    // Mock forgot password endpoint - failure
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: false,
        error: 'Failed to send reset link',
      }, { status: 500 })
    )

    const { container } = renderWithRouter(<ForgotPassword />)

    const emailInput = screen.queryByTestId('forgot-password-email-input') || screen.getByLabelText('Email')
    const submitButton = screen.queryByTestId('forgot-password-submit-button') || screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Wait for error to appear
    await waitFor(() => {
      const errorElement = screen.queryByTestId('forgot-password-error')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement?.textContent?.toLowerCase()).toContain('failed to send reset link')
    }, { timeout: 3000 })
  })

  it('should show success message on successful request', async () => {
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

    // Mock forgot password endpoint - success
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        message: 'Reset link sent',
      })
    )

    renderWithRouter(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitForText('reset link sent', { timeout: 5000 })
    expect(screen.getByTestId('forgot-password-success')).toBeInTheDocument()
    expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument()
  })

  it('should show reset link in development mode', async () => {
    const user = userEvent.setup()
    const resetLink = 'http://localhost:5173/reset-password?token=test-token'

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

    // Mock forgot password endpoint - success with reset link
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        reset_link: resetLink,
      })
    )

    renderWithRouter(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitForText('development mode', { timeout: 5000 })
    expect(screen.getByTestId('forgot-password-dev-link')).toBeInTheDocument()
    expect(screen.getByText(resetLink)).toBeInTheDocument()
  })

  it('should show loading state during request', async () => {
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

    // Mock forgot password endpoint with delay
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve(
        createFetchResponse({
          success: true,
          message: 'Reset link sent',
        })
      ), 100))
    )

    renderWithRouter(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitForText('sending', { timeout: 3000 })
    expect(submitButton).toBeDisabled()
  })
})

