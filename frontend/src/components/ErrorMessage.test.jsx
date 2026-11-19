import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage.jsx';

describe('ErrorMessage', () => {
  it('uses the approved copy for an invalid login', () => {
    render(<ErrorMessage code="invalid-credentials" />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Email or password is incorrect.'
    );
  });

  it.each([
    [401, 'Your session has expired. Please sign in again.'],
    [403, "You don't have access to this page."],
    [409, "You're already clocked in."],
    [500, 'Something went wrong. Please try again.'],
  ])('maps status %i to friendly copy', (code, expected) => {
    render(<ErrorMessage code={code} />);

    expect(screen.getByRole('alert')).toHaveTextContent(expected);
  });

  it('maps offline and duplicate clock-out codes', () => {
    const { rerender } = render(<ErrorMessage code="offline" />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      "You're offline. Check your connection and try again."
    );

    rerender(<ErrorMessage code="duplicate-clock-out" />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      "You're already clocked out."
    );
  });

  it('lets a screen override the shared copy', () => {
    render(
      <ErrorMessage code={500} message="The dashboard could not be loaded." />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The dashboard could not be loaded.'
    );
    expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
  });

  it('never exposes a status code or raw error in the copy', () => {
    render(<ErrorMessage code={500} />);

    const alert = screen.getByRole('alert');
    expect(alert).not.toHaveTextContent('500');
    expect(alert).not.toHaveTextContent(/stack|Error:/i);
  });

  it('renders a working retry action when asked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage code={500} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders a dismiss control only when a handler is provided', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<ErrorMessage code={500} />);
    expect(
      screen.queryByRole('button', { name: 'Dismiss error' })
    ).not.toBeInTheDocument();

    rerender(<ErrorMessage code={500} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
