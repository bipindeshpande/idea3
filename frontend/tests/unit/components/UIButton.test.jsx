import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UIButton from '../../../src/components/ui/ui-button'

describe('UIButton', () => {
  it('should render button with text', () => {
    render(<UIButton>Click me</UIButton>)

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<UIButton onClick={handleClick}>Click me</UIButton>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<UIButton disabled>Click me</UIButton>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeDisabled()
  })

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<UIButton disabled onClick={handleClick}>Click me</UIButton>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should render as different element when as prop is provided', () => {
    render(
      <UIButton as="a" href="/test">
        Link Button
      </UIButton>
    )

    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should apply variant classes', () => {
    const { container } = render(<UIButton variant="secondary">Button</UIButton>)

    const button = container.querySelector('.ui-button--secondary')
    expect(button).toBeInTheDocument()
  })

  it('should apply size classes', () => {
    const { container } = render(<UIButton size="sm">Button</UIButton>)

    const button = container.querySelector('.ui-button--sm')
    expect(button).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<UIButton className="custom-class">Button</UIButton>)

    const button = container.querySelector('.custom-class')
    expect(button).toBeInTheDocument()
  })

  it('should have type="button" by default', () => {
    render(<UIButton>Button</UIButton>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should have type="submit" when specified', () => {
    render(<UIButton type="submit">Submit</UIButton>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})

