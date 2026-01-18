import { validateArea, validateNode, getConnectionId } from '../../src/lib/area-utils';

describe('validateArea', () => {
  it('returns false if no nodes', () => {
    expect(validateArea([], [])).toBe(false);
  });
  it('returns false if only action nodes', () => {
    const nodes = [{ type: 'action', data: {} }];
    expect(validateArea(nodes, [])).toBe(false);
  });
  it('returns false if only reaction nodes', () => {
    const nodes = [{ type: 'reaction', data: {} }];
    expect(validateArea(nodes, [])).toBe(false);
  });
  it('returns false if multiple action nodes', () => {
    const nodes = [
      { type: 'action', data: {} },
      { type: 'action', data: {} },
      { type: 'reaction', data: {} }
    ];
    expect(validateArea(nodes, [])).toBe(false);
  });
  it('returns false if not all nodes valid', () => {
    const nodes = [
      { type: 'action', data: { valid: false } },
      { type: 'reaction', data: { valid: true } }
    ];
    expect(validateArea(nodes, [])).toBe(false);
  });
  it('returns false if not enough links', () => {
    const nodes = [
      { type: 'action', data: { valid: true } },
      { type: 'reaction', data: { valid: true } }
    ];
    expect(validateArea(nodes, [])).toBe(false);
  });
  it('returns true for valid area', () => {
    const nodes = [
      { type: 'action', data: { valid: true } },
      { type: 'reaction', data: { valid: true } }
    ];
    const edges = [{ source: 1, target: 2 }];
    expect(validateArea(nodes, edges)).toBe(true);
  });
});

describe('getConnectionId', () => {
  it('returns undefined if not found', () => {
    expect(getConnectionId('foo', [])).toBeUndefined();
  });
  it('returns id if found', () => {
    const connections = [{ serviceName: 'foo', id: '123' }];
    expect(getConnectionId('foo', connections)).toBe('123');
  });
});
