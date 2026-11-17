// Builds the BrainWeb Claude Desktop extension: bundles the MCP server into one file (esbuild),
// packs it as an MCPB bundle (official @anthropic-ai/mcpb CLI) and puts it in public/ so the site can offer it.
// Run with: npm run build:mcpb
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = path.join(root, 'public', 'brainweb-claude.mcpb');
const cli = path.join(root, 'node_modules', '@anthropic-ai', 'mcpb', 'dist', 'cli', 'cli.js');

fs.rmSync(path.join(here, 'server'), { recursive: true, force: true });
await build({
  entryPoints: [path.join(here, 'src', 'server.js')],
  outfile: path.join(here, 'server', 'index.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  external: ['bufferutil', 'utf-8-validate'],
  legalComments: 'inline',
  logLevel: 'warning',
});
execFileSync(process.execPath, [cli, 'validate', path.join(here, 'manifest.json')], { stdio: 'inherit' });
execFileSync(process.execPath, [cli, 'pack', here, out], { stdio: 'inherit' });
console.log(`✓ ${path.relative(root, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
