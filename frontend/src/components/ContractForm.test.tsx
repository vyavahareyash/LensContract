import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContractForm } from './ContractForm';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock react-select CreatableSelect
jest.mock('react-select/creatable', () => ({
  __esModule: true,
  default: ({ options, onChange, value, isMulti, placeholder }: any) => (
    <input
      data-testid="creatable-select"
      value={value ? (isMulti ? value.map((v: any) => v.label).join(', ') : value.label) : ''}
      onChange={(e) => {
        if (isMulti) {
          onChange(e.target.value.split(', ').map((v: string) => ({ value: v, label: v })));
        } else {
          onChange({ value: e.target.value, label: e.target.value });
        }
      }}
      placeholder={placeholder}
    />
  ),
}));

describe('ContractForm', () => {
  const mockOnContractCreated = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/tasks')) {
        return Promise.resolve({ data: ['Task A', 'Task B'] });
      } else if (url.includes('/tags')) {
        return Promise.resolve({ data: ['tag1', 'tag2'] });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  test('renders form fields correctly', async () => {
    render(<ContractForm onContractCreated={mockOnContractCreated} showModal={true} />);

    expect(screen.getByLabelText(/Contract Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tasks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Contract/i })).toBeInTheDocument();
  });

  test('adds and removes task fields', async () => {
    render(<ContractForm onContractCreated={mockOnContractCreated} showModal={true} />);

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);
    fireEvent.click(addTaskButton);

    const taskInputs = screen.getAllByPlaceholderText(/Task Name/i);
    expect(taskInputs).toHaveLength(2);

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    fireEvent.click(removeButtons[0]);
    expect(screen.getAllByPlaceholderText(/Task Name/i)).toHaveLength(1);
  });

  test('submits new contract successfully', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { inserted_id: '123' } });

    render(<ContractForm onContractCreated={mockOnContractCreated} showModal={true} />);

    fireEvent.change(screen.getByLabelText(/Contract Name/i), { target: { value: 'New Contract' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getAllByPlaceholderText(/Task Name/i)[0], { target: { value: 'Task X' } });
    fireEvent.change(screen.getAllByPlaceholderText(/Amount/i)[0], { target: { value: '500' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Contract/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/contracts',
        {
          name: 'New Contract',
          tasks: [{ name: 'Task X', amount: 500 }],
          tags: [],
        },
        undefined // No config for now, as we removed auth
      );
      expect(mockOnContractCreated).toHaveBeenCalledTimes(1);
    });
  });

  test('updates existing contract successfully', async () => {
    const existingContract = {
      id: 'existing-id',
      name: 'Existing Contract',
      tasks: [{ name: 'Old Task', amount: 100 }],
      tags: ['old-tag'],
    };
    (axios.put as jest.Mock).mockResolvedValueOnce({ data: { status: 'ok' } });

    render(<ContractForm onContractCreated={mockOnContractCreated} showModal={true} contract={existingContract} />);

    expect(screen.getByLabelText(/Contract Name/i)).toHaveValue('Existing Contract');
    expect(screen.getByRole('button', { name: /Update Contract/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Contract Name/i), { target: { value: 'Updated Contract' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Contract/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/contracts/existing-id',
        {
          name: 'Updated Contract',
          tasks: [{ name: 'Old Task', amount: 100 }],
          tags: ['old-tag'],
        },
        undefined // No config for now, as we removed auth
      );
      expect(mockOnContractCreated).toHaveBeenCalledTimes(1);
    });
  });
});
