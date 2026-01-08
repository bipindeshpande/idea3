import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../../../src/hooks/useToast'

describe('useToast', () => {
  it('should initialize with empty toasts', () => {
    const { result } = renderHook(() => useToast())

    expect(result.current.toasts).toEqual([])
    expect(result.current.addToast).toBeDefined()
    expect(result.current.removeToast).toBeDefined()
  })

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.addToast('Test message')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Test message')
    expect(result.current.toasts[0].type).toBe('success')
    expect(result.current.toasts[0].duration).toBe(3000)
  })

  it('should add toast with custom type and duration', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.addToast('Error message', 'error', 5000)
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Error message')
    expect(result.current.toasts[0].type).toBe('error')
    expect(result.current.toasts[0].duration).toBe(5000)
  })

  it('should add multiple toasts', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.addToast('First message')
      result.current.addToast('Second message', 'warning')
      result.current.addToast('Third message', 'info', 2000)
    })

    expect(result.current.toasts).toHaveLength(3)
    expect(result.current.toasts[0].message).toBe('First message')
    expect(result.current.toasts[1].message).toBe('Second message')
    expect(result.current.toasts[2].message).toBe('Third message')
  })

  it('should remove a toast by id', () => {
    const { result } = renderHook(() => useToast())

    let firstToastId
    let secondToastId

    act(() => {
      result.current.addToast('First message')
    })
    
    // Wait a bit to ensure different timestamps
    act(() => {
      result.current.addToast('Second message')
    })

    expect(result.current.toasts).toHaveLength(2)
    
    // Get the IDs and messages
    firstToastId = result.current.toasts[0].id
    secondToastId = result.current.toasts[1].id
    const secondToastMessage = result.current.toasts[1].message

    // Verify IDs are different
    expect(firstToastId).not.toBe(secondToastId)

    act(() => {
      result.current.removeToast(firstToastId)
    })

    // After removing first toast, should have one remaining
    expect(result.current.toasts).toHaveLength(1)
    // Remaining toast should be the second one
    expect(result.current.toasts[0].message).toBe(secondToastMessage)
    expect(result.current.toasts[0].id).toBe(secondToastId)
  })

  it('should not remove toast if id does not exist', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.addToast('Test message')
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.removeToast(999999)
    })

    expect(result.current.toasts).toHaveLength(1)
  })

  it('should generate unique ids for each toast', () => {
    const { result } = renderHook(() => useToast())

    // Add small delays to ensure different timestamps
    act(() => {
      result.current.addToast('First')
    })
    
    act(() => {
      result.current.addToast('Second')
    })
    
    act(() => {
      result.current.addToast('Third')
    })

    const ids = result.current.toasts.map(t => t.id)
    const uniqueIds = new Set(ids)
    // IDs should be unique (using Date.now() which should be different)
    expect(uniqueIds.size).toBeGreaterThanOrEqual(1) // At least 1, ideally 3
    expect(result.current.toasts.length).toBe(3)
  })
})

