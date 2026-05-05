import { render, screen } from '@testing-library/react';
import App from './App';

test('renders event platform headline', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /one elegant control room/i });
  expect(headingElement).toBeInTheDocument();
});
