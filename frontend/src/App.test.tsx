import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock axios to prevent actual API calls
jest.mock('axios');

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/',
  }),
  useNavigate: () => jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    // Mock successful API response for contracts
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/contracts')) {
        return Promise.resolve({
          data: {
            contracts: [
              { id: '1', name: 'Contract 1', tasks: [], tags: [], total_amount: 100 },
              { id: '2', name: 'Contract 2', tasks: [], tags: [], total_amount: 200 },
            ],
            total_count: 2,
          },
        });
      } else if (url.includes('/tags')) {
        return Promise.resolve({ data: ['tag1', 'tag2'] });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  test('renders LensContract brand', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/LensContract/i)).toBeInTheDocument();
  });

  test('renders Create Contract button', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Create Contract/i)).toBeInTheDocument();
  });

  test('renders contracts on home page', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(await screen.findByText(/Contract 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Contract 2/i)).toBeInTheDocument();
  });
});