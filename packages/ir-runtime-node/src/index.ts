import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Caps, FileSystem, Clock, Logger } from '@lordcraymen/ir-caps';
import type { EmitResult } from '@lordcraymen/ir-compiler-core';

// Node FileSystem implementation
class NodeFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    return readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    await writeFile(path, content, 'utf-8');
  }

  async mkdirp(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }
}

// Node Clock implementation
class NodeClock implements Clock {
  now(): number {
    return Date.now();
  }
}

// Node Logger implementation
class NodeLogger implements Logger {
  info(message: string): void {
    console.info(message);
  }

  warn(message: string): void {
    console.warn(message);
  }

  error(message: string): void {
    console.error(message);
  }
}

// Create Node capabilities
export function createNodeCaps(): Caps {
  return {
    fs: new NodeFileSystem(),
    clock: new NodeClock(),
    logger: new NodeLogger(),
  };
}

// Helper to write EmitResult to filesystem
export async function writeEmitResult(
  fsCaps: FileSystem,
  result: EmitResult,
  outDir: string
): Promise<void> {
  await fsCaps.mkdirp(outDir);

  for (const file of result.files) {
    const fullPath = join(outDir, file.path);
    const dir = dirname(fullPath);
    await fsCaps.mkdirp(dir);
    await fsCaps.writeFile(fullPath, file.content);
  }
}
