import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { analyzePaperManifest } from './lib/paper-build-performance.mjs';

const buildRoot = path.resolve(process.argv[2] ?? 'dist-paper-preview');
const manifestPath = path.join(buildRoot, '.vite', 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const analysis = analyzePaperManifest(manifest);
const files = await Promise.all(analysis.initialFiles
    .filter((file) => file.endsWith('.js'))
    .map(async (file) => ({ file, bytes: (await stat(path.join(buildRoot, file))).size })));
const initialJavaScriptBytes = files.reduce((total, item) => total + item.bytes, 0);
const report = { ...analysis, initialJavaScriptBytes, files };
console.log(JSON.stringify(report, null, 2));
if (analysis.phaserInInitial) throw new Error('Phaser leaked into the initial game graph');
if (initialJavaScriptBytes > 1_800_000) throw new Error(`Initial game JavaScript exceeds 1.8 MB: ${initialJavaScriptBytes}`);
