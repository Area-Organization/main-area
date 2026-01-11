import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactionNode from '$lib/components/ReactionNode.svelte';

// Mock XYFlow hooks
const mockUpdateNodeData = vi.fn();
const mockDeleteElements = vi.fn();

vi.mock('@xyflow/svelte', async () => {
  return {
    useSvelteFlow: () => ({
      updateNodeData: mockUpdateNodeData,
      deleteElements: mockDeleteElements
    }),
    Handle: () => {},
    Position: { Left: 'left' }
  };
});

// Mock Draggable
vi.mock('@thisux/sveltednd', () => ({
  draggable: (node: HTMLElement) => ({ destroy: () => {} })
}));

describe('ReactionNode', () => {
  const mockData = {
    info: {
      name: 'Send Email',
      description: 'Sends an email',
      params: {
        to: { type: 'string', label: 'Recipient', required: true, description: 'Email address' }
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reaction details correctly', () => {
    render(ReactionNode, {
      data: mockData,
      id: 'react-1',
      type: 'reaction',
      dragHandle: undefined
    });

    expect(screen.getByText('Send Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
  });

  it('validates required parameters', async () => {
    render(ReactionNode, {
      data: mockData,
      id: 'react-1',
      type: 'reaction',
      dragHandle: undefined
    });

    // Initially invalid (empty required field)
    // We check if updateNodeData was called or if UI reflects state
    // In your component, validation runs on effect, so we expect a call

    const input = screen.getByPlaceholderText('Email address');

    // Simulate typing
    await fireEvent.input(input, { target: { value: 'user@example.com' } });

    expect(mockUpdateNodeData).toHaveBeenCalled();
    // Verify the payload of the update contains valid: true
    expect(mockUpdateNodeData).toHaveBeenCalledWith('react-1', expect.objectContaining({
       valid: true
    }));
  });

  it('calls deleteElements when delete button is clicked', async () => {
    render(ReactionNode, {
      data: mockData,
      id: 'react-1',
      type: 'reaction',
      dragHandle: undefined
    });

    const deleteBtn = screen.getByTitle('Delete node');
    await fireEvent.mouseDown(deleteBtn);

    expect(mockDeleteElements).toHaveBeenCalledWith({ nodes: [{ id: 'react-1' }] });
  });
});
