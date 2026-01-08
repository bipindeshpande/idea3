import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormInput from '../../../src/components/ui/FormInput'

describe('FormInput', () => {
  it('should render input with label', () => {
    render(
      <FormInput
        label="Email"
        value=""
        onChange={() => {}}
      />
    )

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('should render input without label', () => {
    render(
      <FormInput
        value=""
        onChange={() => {}}
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should show required indicator when required', () => {
    render(
      <FormInput
        label="Email"
        value=""
        onChange={() => {}}
        required
      />
    )

    const label = screen.getByText('Email')
    expect(label.querySelector('span')).toHaveTextContent('*')
  })

  it('should display error message', () => {
    render(
      <FormInput
        label="Email"
        value=""
        onChange={() => {}}
        error="Email is required"
      />
    )

    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('should display helper text when no error', () => {
    render(
      <FormInput
        label="Email"
        value=""
        onChange={() => {}}
        helperText="Enter your email address"
      />
    )

    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('should not display helper text when error exists', () => {
    render(
      <FormInput
        label="Email"
        value=""
        onChange={() => {}}
        error="Email is required"
        helperText="Enter your email address"
      />
    )

    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument()
  })

  it('should call onChange when input value changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <FormInput
        label="Email"
        value=""
        onChange={handleChange}
      />
    )

    const input = screen.getByLabelText('Email')
    await user.type(input, 'test@example.com')

    expect(handleChange).toHaveBeenCalled()
  })

  it('should render different input types', () => {
    const { rerender, container } = render(
      <FormInput
        type="email"
        value=""
        onChange={() => {}}
        label="Email"
      />
    )

    let input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')

    rerender(
      <FormInput
        type="password"
        value=""
        onChange={() => {}}
        label="Password"
      />
    )

    // Password inputs might not have accessible labels, use container query as fallback
    const passwordInput = screen.queryByLabelText(/password/i) || 
                         container.querySelector('input[type="password"]')
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should render placeholder', () => {
    render(
      <FormInput
        value=""
        onChange={() => {}}
        placeholder="Enter your email"
      />
    )

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <FormInput
        value=""
        onChange={() => {}}
        disabled
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })
})

