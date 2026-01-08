import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useValidationData } from '../../../src/hooks/validation/useValidationData'
import { createFetchResponse } from '../../setup.jsx'

global.fetch = vi.fn()

describe('useValidationData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    global.fetch = vi.fn()
  })

  it('should set isFirstValidation to true when not authenticated', async () => {
    const { result } = renderHook(() => 
      useValidationData({
        isAuthenticated: false,
        getAuthHeaders: () => ({}),
        inputs: null,
      })
    )

    await waitFor(() => {
      expect(result.current.loadingIntake).toBe(false)
    })

    expect(result.current.isFirstValidation).toBe(true)
    expect(result.current.userIntake).toBeNull()
    expect(result.current.activityData).toBeNull()
  })

  it('should load user intake from inputs when provided', async () => {
    const mockInputs = {
      goal_type: 'start_business',
      time_commitment: 'part_time',
      budget_range: 'low',
    }

    // Mock the API call even though we have inputs (hook still makes the call)
    // The hook checks inputs first, but still makes the API call
    const mockResponse = createFetchResponse({
      success: true,
      activity: { runs: [], validations: [] },
    })
    
    // Set up mock before rendering hook - ensure it returns a proper response
    global.fetch.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => 
      useValidationData({
        isAuthenticated: true,
        getAuthHeaders: () => ({ 'Authorization': 'Bearer token' }),
        inputs: mockInputs,
      })
    )

    await waitFor(() => {
      expect(result.current.loadingIntake).toBe(false)
    }, { timeout: 3000 })

    // Should use inputs from context, not API (hook checks if prevUserIntake exists)
    expect(result.current.userIntake).toEqual(mockInputs)
  })

  it('should load user intake from API when inputs not provided', async () => {
    const mockActivityData = {
      runs: [{
        inputs: {
          goal_type: 'start_business',
          time_commitment: 'full_time',
        }
      }],
      validations: []
    }

    const mockResponse = createFetchResponse({
      success: true,
      activity: mockActivityData,
    })
    
    // Set up mock before rendering hook
    global.fetch.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => 
      useValidationData({
        isAuthenticated: true,
        getAuthHeaders: () => ({ 'Authorization': 'Bearer token' }),
        inputs: null,
      })
    )

    await waitFor(() => {
      expect(result.current.loadingIntake).toBe(false)
    }, { timeout: 3000 })

    expect(result.current.userIntake).toEqual(mockActivityData.runs[0].inputs)
    expect(result.current.activityData).toEqual(mockActivityData)
    expect(result.current.isFirstValidation).toBe(true)
  })

  it('should set isFirstValidation to false when validations exist', async () => {
    const mockActivityData = {
      runs: [],
      validations: [{ id: '1' }, { id: '2' }]
    }

    const mockResponse = createFetchResponse({
      success: true,
      activity: mockActivityData,
    })
    
    // Set up mock before rendering hook
    global.fetch.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => 
      useValidationData({
        isAuthenticated: true,
        getAuthHeaders: () => ({ 'Authorization': 'Bearer token' }),
        inputs: null,
      })
    )

    await waitFor(() => {
      expect(result.current.loadingIntake).toBe(false)
      expect(result.current.activityData).toBeDefined()
    }, { timeout: 3000 })

    // Check that validations array exists and has items
    expect(result.current.activityData?.validations).toHaveLength(2)
    // The hook checks validationCount = validations.length || 0
    // So if validations.length > 0, isFirstValidation should be false
    expect(result.current.isFirstValidation).toBe(false)
  })

  it('should handle API errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => 
      useValidationData({
        isAuthenticated: true,
        getAuthHeaders: () => ({ 'Authorization': 'Bearer token' }),
        inputs: null,
      })
    )

    await waitFor(() => {
      expect(result.current.loadingIntake).toBe(false)
    })

    expect(result.current.isFirstValidation).toBe(true)
    expect(result.current.userIntake).toBeNull()
  })

  it('should not overwrite inputs from context when API returns data', async () => {
    const contextInputs = {
      goal_type: 'start_business',
      time_commitment: 'part_time',
    }

    const mockActivityData = {
      runs: [{
        inputs: {
          goal_type: 'different_goal',
          time_commitment: 'full_time',
        }
      }],
      validations: []
    }

    const mockResponse = createFetchResponse({
      success: true,
      activity: mockActivityData,
    })
    
    // Set up mock before rendering hook
    global.fetch.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => 
      useValidationData({
        isAuthenticated: true,
        getAuthHeaders: () => ({ 'Authorization': 'Bearer token' }),
        inputs: contextInputs,
      })
    )

    await waitFor(() => {
      expect(result.current.loadingIntake).toBe(false)
    }, { timeout: 3000 })

    // Should keep context inputs, not API inputs (hook checks if prevUserIntake exists)
    expect(result.current.userIntake).toEqual(contextInputs)
  })
})

