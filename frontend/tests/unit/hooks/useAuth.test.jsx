import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../../src/context/AuthContext'
import { createFetchResponse } from '../../setup.jsx'

// Mock fetch
global.fetch = vi.fn()

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should login successfully', async () => {
    const mockUser = { user_id: '123', email: 'test@example.com' }
    const mockToken = 'test-token'
    
    // Mock login endpoint (apiClient uses /api prefix)
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

    // Mock auth check endpoint (called by useEffect when sessionToken changes after login)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: mockUser,
      })
    )

    // Mock subscription status endpoint (called after auth check in useEffect)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    // Wait for initial loading to complete (AuthProvider checks auth on mount)
    // This ensures all async operations in useEffect complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 3000 })

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    // Wait for all async state updates to complete
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    }, { timeout: 3000 })
  })

  it('should logout successfully', async () => {
    const sessionToken = 'test-token'
    localStorage.setItem('sia_session_token', sessionToken)
    
    // Mock auth check endpoint (called by AuthProvider on mount)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: { user_id: '123', email: 'test@example.com' },
      })
    )

    // Mock subscription status endpoint (called after auth check)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock logout endpoint
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({ success: true })
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // Wait for initial auth check to complete
    // This ensures all async operations in useEffect complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 3000 })

    await act(async () => {
      await result.current.logout()
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorage.getItem('sia_session_token')).toBeNull()
    }, { timeout: 3000 })
  })

  it('should change password successfully', async () => {
    const sessionToken = 'test-token'
    localStorage.setItem('sia_session_token', sessionToken)
    
    // Mock auth check endpoint (called on mount)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        user: { user_id: '123', email: 'test@example.com' },
      })
    )

    // Mock subscription status endpoint (called after auth check)
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        subscription: null,
      })
    )

    // Mock change password endpoint
    global.fetch.mockResolvedValueOnce(
      createFetchResponse({
        success: true,
        message: 'Password changed successfully',
      })
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // Wait for initial auth check to complete
    // This ensures all async operations in useEffect complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 3000 })

    let response
    await act(async () => {
      response = await result.current.changePassword('old', 'new')
    })

    expect(response.success).toBe(true)
  })
})

