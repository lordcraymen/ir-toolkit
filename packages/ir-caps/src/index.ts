// FileSystem capability
export interface FileSystem {
  readFile(_path: string): Promise<string>;
  writeFile(_path: string, _content: string): Promise<void>;
  mkdirp(_path: string): Promise<void>;
}

// Clock capability
export interface Clock {
  now(): number;
}

// Logger capability
export interface Logger {
  info(_message: string): void;
  warn(_message: string): void;
  error(_message: string): void;
}

// Combined capabilities
export interface Caps {
  fs: FileSystem;
  clock: Clock;
  logger: Logger;
}
