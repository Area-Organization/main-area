import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActionNode from '$lib/components/ActionNode.svelte';

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
    Position: { Right: 'right' }
  };
});

// Mock Draggable Action
vi.mock('@thisux/sveltednd', () => ({
  draggable: (node: HTMLElement) => ({ destroy: () => {} })
}));

// Mock Svelte Context
vi.mock('svelte', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getContext: (key: string) => {
      if (key === 'flow-edges') return { value: [] };
      return null;
    }
  };
});

describe('ActionNode', () => {
  const mockData = {
    info: {
      name: 'Test Action',
      description: 'Desc',
      params: {
        repo: { type: 'string', label: 'Repository', required: true, description: 'Repo Name' }
      },
      variables: []
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders action name and inputs', () => {
    render(ActionNode, {
      data: mockData,
      id: 'node-1',
      type: 'action',
      dragHandle: undefined
    });

    // Check for the title
    expect(screen.getByText('Test Action')).toBeInTheDocument();

    // Check for the parameter label (it is text in a div, not a <label>)
    expect(screen.getByText('Repository')).toBeInTheDocument();

    // Check for the input via its placeholder
    expect(screen.getByPlaceholderText('Repo Name')).toBeInTheDocument();
  });

  it('updates node data validation when input changes', async () => {
    render(ActionNode, {
      data: mockData,
      id: 'node-1',
      type: 'action',
      dragHandle: undefined
    });

    const input = screen.getByPlaceholderText('Repo Name');
    await fireEvent.input(input, { target: { value: 'my-repo' } });

    expect(mockUpdateNodeData).toHaveBeenCalled();
  });

  it('shows validation error for required input', async () => {
    render(ActionNode, {
      data: mockData,
      id: 'node-1',
      type: 'action',
      dragHandle: undefined
    });

    const input = screen.getByPlaceholderText('Repo Name');
    await fireEvent.input(input, { target: { value: '' } });

    // Expect some error message or invalid state
    // (Adjust this to your actual UI)
    expect(mockUpdateNodeData).toHaveBeenCalledWith('node-1', expect.objectContaining({
      valid: false
    }));
  });
});
