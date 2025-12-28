import { describe, it, expect } from 'vitest';
import type { FileSystem, Clock, Logger, Caps } from '../src/index.js';

describe('ir-caps', () => {
  it('FileSystem interface is defined', () => {
    const mockFs: FileSystem = {
      readFile: async () => 'content',
      writeFile: async () => {},
      mkdirp: async () => {},
    };

    expect(mockFs).toBeDefined();
    expect(typeof mockFs.readFile).toBe('function');
    expect(typeof mockFs.writeFile).toBe('function');
    expect(typeof mockFs.mkdirp).toBe('function');
  });

  it('Clock interface is defined', () => {
    const mockClock: Clock = {
      now: () => 1234567890,
    };

    expect(mockClock).toBeDefined();
    expect(typeof mockClock.now).toBe('function');
  });

  it('Logger interface is defined', () => {
    const mockLogger: Logger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    expect(mockLogger).toBeDefined();
    expect(typeof mockLogger.info).toBe('function');
    expect(typeof mockLogger.warn).toBe('function');
    expect(typeof mockLogger.error).toBe('function');
  });

  it('Caps interface combines all capabilities', () => {
    const mockCaps: Caps = {
      fs: {
        readFile: async () => 'content',
        writeFile: async () => {},
        mkdirp: async () => {},
      },
      clock: {
        now: () => 1234567890,
      },
      logger: {
        info: () => {},
        warn: () => {},
        error: () => {},
      },
    };

    expect(mockCaps).toBeDefined();
    expect(mockCaps.fs).toBeDefined();
    expect(mockCaps.clock).toBeDefined();
    expect(mockCaps.logger).toBeDefined();
  });
});
