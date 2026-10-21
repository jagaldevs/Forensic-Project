import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';

test('renders the lab', () => {
  render(<App />);
  expect(screen.getByText(/Digital Forensics Lab/)).toBeInTheDocument();
});
