import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import SuccessMessage from './SuccessMessage.jsx';

afterEach(() => {
  vi.useRealTimers();
});

describe('SuccessMessage', () => {
  it('announces a polite success message', () => {
    render(<SuccessMessage message="You're clocked in." />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent("You're clocked in.");
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('shows an optional title with the detail', () => {
    render(<SuccessMessage title="Clocked in" message="Recorded at 09:02." />);

    expect(screen.getByText('Clocked in')).toBeInTheDocument();
    expect(screen.getByText('Recorded at 09:02.')).toBeInTheDocument();
  });

  it('dismisses when a handler is provided', () => {
    const onDismiss = vi.fn();
    render(<SuccessMessage message="Saved." onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss message' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not auto-hide unless a timeout is requested', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<SuccessMessage message="Saved." onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('auto-hides after the requested timeout', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <SuccessMessage
        message="Saved."
        autoHideMs={4000}
        onDismiss={onDismiss}
      />
    );

    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
