import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestProviders } from '@/test/TestProviders';
import HomePage from '@/features/home/pages/HomePage';

describe('HomePage', () => {
  it('renders the title', () => {
    render(
      <TestProviders>
        <HomePage />
      </TestProviders>,
    );
    expect(screen.getByText('Harness Engineering Template')).toBeInTheDocument();
  });
});
