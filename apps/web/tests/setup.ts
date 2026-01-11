import '@testing-library/jest-dom';
import { FormatRegistry } from '@sinclair/typebox';

/**
 * TypeBox does not include format validators by default.
 * We need to register them for tests to pass.
 */
FormatRegistry.Set('email', (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
