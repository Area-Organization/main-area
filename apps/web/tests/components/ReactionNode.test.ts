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

// Mock Svelte Context - providing an edge so the node is "connected"
vi.mock('svelte', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getContext: (key: string) => {
      if (key === 'flow-edges') {
        return {
          value: [{ source: 'action-1', target: 'react-1' }]
        };
      }
      return null;
    }
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
    },
    label: 'reaction'
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

    const input = screen.getByPlaceholderText('Email address');

    // Simulate typing a value into the required field
    await fireEvent.input(input, { target: { value: 'user@example.com' } });

    expect(mockUpdateNodeData).toHaveBeenCalled();
    expect(mockUpdateNodeData).toHaveBeenCalledWith('react-1', expect.objectContaining({
       valid: true,
       paramValues: { to: 'user@example.com' }
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
