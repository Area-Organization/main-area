import { client } from '../../src/lib/api';

describe('api client', () => {
  it('should be defined', () => {
    expect(client).toBeDefined();
  });
});
