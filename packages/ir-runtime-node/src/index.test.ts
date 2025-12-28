import { describe, it, expect } from 'vitest';
import { createNodeCaps } from '../src/index.js';

describe('ir-runtime-node', () => {
  it('createNodeCaps returns all capabilities', () => {
    const caps = createNodeCaps();

    expect(caps).toBeDefined();
    expect(caps.fs).toBeDefined();
    expect(caps.clock).toBeDefined();
    expect(caps.logger).toBeDefined();
  });

  it('FileSystem capability has correct methods', () => {
    const caps = createNodeCaps();

    expect(typeof caps.fs.readFile).toBe('function');
    expect(typeof caps.fs.writeFile).toBe('function');
    expect(typeof caps.fs.mkdirp).toBe('function');
  });

  it('Clock capability returns a number', () => {
    const caps = createNodeCaps();
    const now = caps.clock.now();

    expect(typeof now).toBe('number');
    expect(now).toBeGreaterThan(0);
  });

  it('Logger capability has correct methods', () => {
    const caps = createNodeCaps();

    expect(typeof caps.logger.info).toBe('function');
    expect(typeof caps.logger.warn).toBe('function');
    expect(typeof caps.logger.error).toBe('function');
  });

  it('Logger methods do not throw', () => {
    const caps = createNodeCaps();

    expect(() => caps.logger.info('test')).not.toThrow();
    expect(() => caps.logger.warn('test')).not.toThrow();
    expect(() => caps.logger.error('test')).not.toThrow();
  });
});
