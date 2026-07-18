import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'paper-preview', 'public', 'art', 'awards');

const stamps = [
    { id: 'iss-delivery', paper: '#f5e4b7', ink: '#15243a', accent: '#d85f43', sky: '#65b8bd', symbol: '<path d="M68 121h120v22H68zM95 91h66v82H95zM52 102h34v59H52zm118 0h34v59h-34z"/><path d="M116 65h24v27h-24zM73 133h110" fill="none" stroke-width="9"/>' },
    { id: 'hubble-maintenance', paper: '#e9edf0', ink: '#19283d', accent: '#e47a42', sky: '#537e9d', symbol: '<path d="M78 89h92v78H78z"/><path d="M46 105h31v47H46zm125 0h39v47h-39zM112 59h24v31h-24z"/><circle cx="124" cy="128" r="25" fill="none" stroke-width="11"/><path d="M148 108l33-29" fill="none" stroke-width="10"/>' },
    { id: 'lunar-sweep', paper: '#dce1df', ink: '#1a293c', accent: '#f06449', sky: '#4b7982', symbol: '<path d="M159 70a67 67 0 1 0 24 113 73 73 0 0 1-24-113z"/><circle cx="103" cy="131" r="9"/><circle cx="142" cy="163" r="7"/><path d="M46 87c33-28 82-38 137-17M67 63l-21 24 31 7" fill="none" stroke-width="9"/>' },
    { id: 'mars-relay', paper: '#f1d9c8', ink: '#17283d', accent: '#ca513c', sky: '#5f9ba7', symbol: '<circle cx="126" cy="132" r="57"/><path d="M87 112c20-15 50-20 81-6M76 145c31 10 58 12 101-3" fill="none" stroke-width="9"/><path d="M122 73V43m0 0l-13 17m13-17 13 17M70 80c-19-17-31-9-35 7m139-7c19-17 31-9 35 7" fill="none" stroke-width="9"/>' },
    { id: 'jupiter-slingshot', paper: '#f2dfc3', ink: '#17283d', accent: '#d85f43', sky: '#4c9cad', symbol: '<circle cx="126" cy="128" r="58"/><path d="M72 103h108M70 126h112M78 151h96" fill="none" stroke-width="9"/><path d="M53 177c-25-72 52-137 131-104 33 14 37 49 16 72-19 20-47 25-74 21" fill="none" stroke-width="10"/><path d="M129 153l-18 16 25 6"/>' }
];

function svg(stamp) {
    return `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="paper"><feTurbulence baseFrequency=".055" numOctaves="4" seed="18" type="fractalNoise"/><feColorMatrix values=".24 0 0 0 .72  0 .24 0 0 .72  0 0 .24 0 .72  0 0 0 .2 0"/><feBlend in="SourceGraphic" mode="multiply"/></filter></defs>
      <path d="M128 9l20 7 21-2 15 15 20 7 7 20 15 15-2 21 7 20-7 20 2 21-15 15-7 20-20 7-15 15-21-2-20 7-20-7-21 2-15-15-20-7-7-20-15-15 2-21-7-20 7-20-2-21 15-15 7-20 20-7 15-15 21 2z" fill="${stamp.ink}"/>
      <circle cx="128" cy="128" r="106" fill="${stamp.paper}" stroke="${stamp.accent}" stroke-width="11"/>
      <circle cx="128" cy="128" r="88" fill="${stamp.sky}" stroke="${stamp.ink}" stroke-width="6" stroke-dasharray="5 7"/>
      <g fill="${stamp.paper}" stroke="${stamp.ink}" stroke-linejoin="round" stroke-linecap="round" stroke-width="7">${stamp.symbol}</g>
      <path d="M43 172c44 19 126 24 171-1l-7 31c-49 19-110 16-158-1z" fill="${stamp.accent}" stroke="${stamp.ink}" stroke-width="7" stroke-linejoin="round"/>
      <g filter="url(#paper)" opacity=".48"><circle cx="128" cy="128" r="104" fill="#fff"/></g>
      <path d="M58 49l13 5M187 49l12-5M47 97l12 2M197 96l12-3" stroke="#fff" opacity=".58" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
}

await mkdir(output, { recursive: true });
for (const stamp of stamps) {
    await sharp(Buffer.from(svg(stamp)))
        .resize(256, 256)
        .webp({ quality: 84, effort: 6 })
        .toFile(path.join(output, `contract-${stamp.id}.webp`));
}
