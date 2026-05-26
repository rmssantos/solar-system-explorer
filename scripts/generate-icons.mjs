/**
 * Generate PWA PNG icons from icons/icon.svg.
 * Outputs: icons/icon-192.png, icons/icon-512.png, icons/icon-maskable-512.png
 *
 * Maskable variant adds ~12% safe-zone padding so platform masks (Android, etc.)
 * never crop the rocket/sun composition.
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'icons/icon.svg');

const svg = await readFile(svgPath);

async function render(size, outName) {
    const buf = await sharp(svg, { density: 384 })
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
    await writeFile(resolve(root, 'public/icons', outName), buf);
    console.log(`  → icons/${outName} (${buf.length} bytes)`);
}

// Maskable: render the SVG on a solid background with safe-zone padding (~12% on each side).
async function renderMaskable(size, outName) {
    const inner = Math.round(size * 0.76);
    const pad = Math.round((size - inner) / 2);
    const inset = await sharp(svg, { density: 384 })
        .resize(inner, inner)
        .png()
        .toBuffer();
    const bg = sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 26, g: 10, b: 46, alpha: 1 }, // theme #1a0a2e
        },
    }).png({ compressionLevel: 9 });
    const composed = await bg.composite([{ input: inset, top: pad, left: pad }]).toBuffer();
    await writeFile(resolve(root, 'public/icons', outName), composed);
    console.log(`  → icons/${outName} (${composed.length} bytes, maskable)`);
}

console.log('Generating PWA icons from icons/icon.svg...');
await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
await renderMaskable(512, 'icon-maskable-512.png');
console.log('Done.');
