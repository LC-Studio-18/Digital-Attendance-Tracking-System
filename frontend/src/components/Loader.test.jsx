import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from './Loader.jsx';

describe('Loader', () => {
  it('announces a default loading state', () => {
    render(<Loader />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading…');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('accepts a context-specific label and size', () => {
    const { container } = render(
      <Loader label="Loading live attendance…" size="lg" />
    );

    expect(screen.getByText('Loading live attendance…')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('loader--lg');
  });

  it('supports inline placement without changing the label', () => {
    const { container } = render(
      <Loader label="Signing in…" size="sm" inline />
    );

    expect(container.firstChild).toHaveClass('loader--inline');
    expect(screen.getByRole('status')).toHaveTextContent('Signing in…');
  });

  it('falls back to the medium size for an unknown value', () => {
    const { container } = render(<Loader size="huge" />);

    expect(container.firstChild).toHaveClass('loader--md');
    expect(container.firstChild).not.toHaveClass('loader--huge');
  });
});
