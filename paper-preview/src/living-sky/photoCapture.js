const MAX_PHOTO_WIDTH = 960;
const WEBP_QUALITY = 0.78;
const clampByte = (value) => Math.max(0, Math.min(255, Math.round(value)));

export function mapInstrumentPixel(filter, pixel) {
    const [red = 0, green = 0, blue = 0, alpha = 255] = pixel;
    if (filter === 'visible') return [red, green, blue, alpha];
    const light = Math.max(0, Math.min(1, (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255));
    if (filter === 'infrared') {
        return [
            clampByte(28 + light * 218),
            clampByte(32 + light * 62),
            clampByte(88 + light * 22),
            alpha
        ];
    }
    if (filter === 'magnetic') {
        return [
            clampByte(18 + light * 48),
            clampByte(78 + light * 138),
            clampByte(142 + light * 108),
            alpha
        ];
    }
    return [red, green, blue, alpha];
}

function encodeCanvas(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob?.((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Could not encode explorer photo'));
        }, 'image/webp', WEBP_QUALITY);
    });
}

export async function captureSkyPhoto(sourceCanvas, options = {}) {
    if (!sourceCanvas || !Number.isFinite(sourceCanvas.width) || !Number.isFinite(sourceCanvas.height)
        || sourceCanvas.width <= 0 || sourceCanvas.height <= 0) {
        throw new Error('A live renderer canvas is required');
    }
    const filter = ['visible', 'infrared', 'magnetic'].includes(options.filter) ? options.filter : 'visible';
    let createCanvas = options.createCanvas;
    if (!createCanvas) createCanvas = () => globalThis.document.createElement('canvas');
    const scale = Math.min(1, MAX_PHOTO_WIDTH / sourceCanvas.width);
    const width = Math.max(1, Math.round(sourceCanvas.width * scale));
    const height = Math.max(1, Math.round(sourceCanvas.height * scale));
    const canvas = createCanvas();
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext?.('2d', { willReadFrequently: filter !== 'visible' });
    if (!context) throw new Error('Explorer photo canvas is unavailable');
    context.drawImage(sourceCanvas, 0, 0, width, height);
    if (filter !== 'visible') {
        const imageData = context.getImageData(0, 0, width, height);
        for (let index = 0; index < imageData.data.length; index += 4) {
            imageData.data.set(mapInstrumentPixel(filter, imageData.data.slice(index, index + 4)), index);
        }
        context.putImageData(imageData, 0, 0);
    }
    const blob = await encodeCanvas(canvas);
    return Object.freeze({ blob, width, height, filter, mimeType: 'image/webp' });
}
