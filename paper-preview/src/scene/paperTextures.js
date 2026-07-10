import * as THREE from 'three';

function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
        return value / 4294967296;
    };
}

function makeCanvasTexture({ size = 384, baseColor, seed, paint }) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    const random = seededRandom(seed);

    context.fillStyle = baseColor;
    context.fillRect(0, 0, size, size);
    paint?.(context, size, random);

    context.globalCompositeOperation = 'multiply';
    for (let index = 0; index < 520; index += 1) {
        const opacity = 0.025 + random() * 0.055;
        context.strokeStyle = `rgba(66, 54, 39, ${opacity})`;
        context.lineWidth = 0.35 + random() * 1.1;
        const x = random() * size;
        const y = random() * size;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 8 + random() * 34, y + (random() - 0.5) * 5);
        context.stroke();
    }

    context.globalCompositeOperation = 'screen';
    for (let index = 0; index < 160; index += 1) {
        const radius = 0.3 + random() * 1.1;
        context.fillStyle = `rgba(255, 250, 224, ${0.035 + random() * 0.07})`;
        context.beginPath();
        context.arc(random() * size, random() * size, radius, 0, Math.PI * 2);
        context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    return texture;
}

function paintNightCard(context, size, random) {
    context.fillStyle = 'rgba(31, 51, 91, 0.28)';
    for (let index = 0; index < 18; index += 1) {
        const y = random() * size;
        context.fillRect(0, y, size, 1 + random() * 2);
    }
}

function paintSun(context, size, random) {
    for (let index = 0; index < 34; index += 1) {
        const x = random() * size;
        const y = random() * size;
        const radius = 6 + random() * 28;
        context.fillStyle = random() > 0.45
            ? 'rgba(255, 222, 96, 0.42)'
            : 'rgba(210, 105, 48, 0.18)';
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
    }
}

function paintEarth(context, size) {
    context.fillStyle = '#6b985b';
    const landShapes = [
        [[0.14, 0.32], [0.25, 0.19], [0.39, 0.24], [0.42, 0.38], [0.31, 0.47], [0.18, 0.43]],
        [[0.52, 0.17], [0.72, 0.21], [0.86, 0.36], [0.78, 0.51], [0.63, 0.44], [0.57, 0.31]],
        [[0.44, 0.55], [0.59, 0.51], [0.66, 0.65], [0.57, 0.84], [0.45, 0.74]],
        [[0.75, 0.66], [0.86, 0.65], [0.9, 0.76], [0.82, 0.82], [0.73, 0.76]]
    ];

    for (const points of landShapes) {
        context.beginPath();
        points.forEach(([x, y], index) => {
            const method = index === 0 ? 'moveTo' : 'lineTo';
            context[method](x * size, y * size);
        });
        context.closePath();
        context.fill();
    }

    context.strokeStyle = 'rgba(255, 248, 223, 0.58)';
    context.lineWidth = size * 0.018;
    context.lineCap = 'round';
    for (const y of [0.3, 0.58]) {
        context.beginPath();
        context.moveTo(size * 0.08, size * y);
        context.bezierCurveTo(size * 0.3, size * (y - 0.08), size * 0.56, size * (y + 0.07), size * 0.91, size * (y - 0.02));
        context.stroke();
    }
}

function paintSaturn(context, size) {
    const bands = [
        ['#d9a55a', 0.1, 0.17],
        ['#f0cb83', 0.23, 0.1],
        ['#bd7950', 0.4, 0.08],
        ['#f6d99a', 0.53, 0.14],
        ['#c9885a', 0.72, 0.07],
        ['#e9bd72', 0.84, 0.1]
    ];
    for (const [color, y, height] of bands) {
        context.fillStyle = color;
        context.fillRect(0, size * y, size, size * height);
    }
}

export function createPaperTextures(renderer) {
    const textures = {
        night: makeCanvasTexture({ baseColor: '#101936', seed: 4, size: 512, paint: paintNightCard }),
        cardboard: makeCanvasTexture({ baseColor: '#b99458', seed: 18 }),
        cream: makeCanvasTexture({ baseColor: '#f3e6be', seed: 23 }),
        sun: makeCanvasTexture({ baseColor: '#f5b83d', seed: 31, paint: paintSun }),
        earth: makeCanvasTexture({ baseColor: '#4388b8', seed: 47, paint: paintEarth }),
        saturn: makeCanvasTexture({ baseColor: '#e7bb70', seed: 63, paint: paintSaturn }),
        coral: makeCanvasTexture({ baseColor: '#d85d4a', seed: 74 }),
        leaf: makeCanvasTexture({ baseColor: '#6b985b', seed: 85 })
    };

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    for (const texture of Object.values(textures)) {
        texture.anisotropy = Math.min(4, maxAnisotropy);
    }
    textures.night.wrapS = THREE.RepeatWrapping;
    textures.night.wrapT = THREE.RepeatWrapping;
    textures.night.repeat.set(3, 2);
    return textures;
}
