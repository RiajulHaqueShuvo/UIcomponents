#!/usr/bin/env node
/*
 * npm run dev:all — starts the API server (restarts on changes) and the
 * Vite dev server together. Ctrl+C stops both.
 */
import { spawn } from 'node:child_process';

const API_PORT = process.env.API_PORT ?? '5621';

const run = (name, args, env = {}) => {
  // Both run with this same Node binary: no shell needed, works on every OS.
  const child = spawn(process.execPath, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
  });
  const prefix = (line) => `[${name}] ${line}`;
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (buf) =>
      buf
        .toString()
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((l) => console.log(prefix(l)))
    );
  }
  child.on('exit', (code) => {
    console.log(prefix(`exited (${code})`));
    process.exit(code ?? 0);
  });
  return child;
};

// The API gets its own port explicitly: a PORT set for the whole command
// (some launchers do this) must not make it collide with Vite on 5620.
const children = [
  run('api', ['--watch-path=server/src', 'server/src/index.ts'], { PORT: API_PORT }),
  run('web', ['node_modules/vite/bin/vite.js'], { API_PORT }),
];

const stop = () => children.forEach((c) => c.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
