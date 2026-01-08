import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AccountPage from '../../../src/pages/dashboard/Account'
import { AuthProvider } from '../../../src/context/AuthContext'
import { createFetchResponse } from '../../setup.jsx'

// Mock fetch
global.fetch = vi.fn()

const renderWithRouter = (component) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

describe('AccountPage', () => {
  const mockUser = {
    user_id: '123',
    email: 'test@example.com',
    is_active: true,
  }

  const mockSubscription = {
    type: 'pro',
    status: 'active',
    is_active: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('sia_session_token', 'test-token')
    
    // Mock the auth check endpoint (called by AuthProvider)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: mockUser,
      })
    )

    // Mock the subscription status endpoint (called by AuthProvider)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: mockSubscription,
      })
    )
  })

  it('should render account information', async () => {
    // Mock the subscription status endpoint (called by AccountPage)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: mockSubscription,
        payment_history: [],
      })
    )

    // Mock the psychology endpoint (called by AccountPage)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        data: {},
      })
    )

    renderWithRouter(<AccountPage />)

    await waitFor(() => {
      expect(screen.getByText(/Account Information/i)).toBeInTheDocument()
    })
  })

  it('should display subscription information', async () => {
    // Mock the subscription status endpoint (called by AccountPage)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: mockSubscription,
        payment_history: [],
      })
    )

    // Mock the psychology endpoint (called by AccountPage)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        data: {},
      })
    )

    renderWithRouter(<AccountPage />)

    // Wait for subscription section to load
    await waitFor(() => {
      expect(screen.getByText('Subscription')).toBeInTheDocument()
    })

    // Find the subscription plan text more specifically
    // Look for "Pro" that appears after "Plan" label in the subscription section
    await waitFor(() => {
      // Get all elements containing "Pro" and find the one in the subscription plan section
      const planLabels = screen.getAllByText(/Plan/i)
      expect(planLabels.length).toBeGreaterThan(0)
      
      // Find the "Pro" text that's in a paragraph after a "Plan" label
      // This should be the subscription plan name, not "Founder Profile" or "Add Profile"
      const proTexts = screen.getAllByText(/Pro/i)
      // The subscription plan "Pro" should be in a <p> tag with class containing "text-xl"
      const subscriptionPro = proTexts.find(el => {
        return el.tagName === 'P' && 
               el.textContent === 'Pro' &&
               el.className.includes('text-xl')
      })
      expect(subscriptionPro).toBeInTheDocument()
    })
  })
})

