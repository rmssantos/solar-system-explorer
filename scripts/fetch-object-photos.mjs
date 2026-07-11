import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { OBJECT_PHOTOS } from '../paper-preview/src/learning/objectPhotoCatalog.js';

const root = path.resolve(import.meta.dirname, '..');
const outputDirectory = path.join(root, 'paper-preview', 'public', 'learning', 'objects');

async function nasaAssetUrl(nasaId) {
    const response = await fetch(`https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`);
    if (!response.ok) throw new Error(`NASA asset ${nasaId}: HTTP ${response.status}`);
    const payload = await response.json();
    const candidates = payload.collection.items
        .map((item) => item.href?.replace(/^http:/, 'https:'))
        .filter((href) => /\.(?:jpe?g|png|webp|tif)$/i.test(href ?? ''));
    return candidates.find((href) => /~orig\./i.test(href))
        ?? candidates.find((href) => /~large\./i.test(href))
        ?? candidates[0];
}

async function pageImageUrl(pageUrl) {
    const html = await (await fetch(pageUrl)).text();
    const match = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)/i)
        ?? html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
    if (!match) throw new Error(`No og:image found at ${pageUrl}`);
    return match[1].replaceAll('&amp;', '&');
}

function commonsAssetUrl(file) {
    return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=1400`;
}

async function remoteImageUrl(photo) {
    if (photo.nasaId) return nasaAssetUrl(photo.nasaId);
    if (photo.commonsFile) return commonsAssetUrl(photo.commonsFile);
    if (photo.pageImage) return pageImageUrl(photo.sourceUrl);
    throw new Error(`No remote asset locator for ${photo.localPhoto}`);
}

async function download(photo, key) {
    const url = await remoteImageUrl(photo);
    const response = await fetch(url, { headers: { 'user-agent': 'PaperSolarExplorer/1.0 educational asset builder' } });
    if (!response.ok) throw new Error(`${key}: HTTP ${response.status} for ${url}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const target = path.join(outputDirectory, `${key}.jpg`);
    await sharp(buffer, { failOn: 'none' })
        .rotate()
        .resize(720, 480, { fit: 'contain', background: '#050812', withoutEnlargement: false })
        .jpeg({ quality: 84, progressive: true, mozjpeg: true })
        .toFile(target);
    return { key, target, source: url };
}

await mkdir(outputDirectory, { recursive: true });

for (const [key, photo] of Object.entries(OBJECT_PHOTOS)) {
    const result = await download(photo, key);
    const size = (await readFile(result.target)).byteLength;
    console.log(`${key.padEnd(15)} ${String(size).padStart(7)} bytes  ${result.source}`);
}
