import { describe, expect, it, vi } from 'vitest';
import { captureSkyPhoto, mapInstrumentPixel } from '../paper-preview/src/living-sky/photoCapture.js';

function createCanvasFactory() {
    const calls = { drawImage: [], putImageData: [], encoding: [] };
    const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({
            drawImage: (...args) => calls.drawImage.push(args),
            getImageData: (_x, _y, width, height) => {
                const data = new Uint8ClampedArray(width * height * 4);
                for (let index = 0; index < data.length; index += 4) data.set([180, 120, 80, 255], index);
                return { data, width, height };
            },
            putImageData: (...args) => calls.putImageData.push(args)
        }),
        toBlob(callback, type, quality) {
            calls.encoding.push({ type, quality });
            callback(new Blob(['encoded'], { type }));
        }
    };
    return { createCanvas: vi.fn(() => canvas), canvas, calls };
}

describe('Explorer camera capture', () => {
    it('keeps visible light unchanged and uses cool non-sepia scientific mappings', () => {
        expect(mapInstrumentPixel('visible', [180, 120, 80, 255])).toEqual([180, 120, 80, 255]);
        const infrared = mapInstrumentPixel('infrared', [240, 220, 200, 255]);
        const magnetic = mapInstrumentPixel('magnetic', [80, 120, 180, 255]);
        expect(infrared[0]).toBeGreaterThan(infrared[2]);
        expect(infrared[1]).toBeLessThan(150);
        expect(magnetic[2]).toBeGreaterThan(magnetic[0]);
        expect(magnetic[1]).toBeGreaterThan(100);
        for (const pixel of [infrared, magnetic]) {
            expect(pixel[0] > 160 && pixel[1] > 140 && pixel[2] < 90).toBe(false);
        }
    });

    it('downscales the live renderer to a bounded WebP while preserving aspect ratio', async () => {
        const factory = createCanvasFactory();
        const result = await captureSkyPhoto({ width: 1920, height: 1080 }, {
            filter: 'infrared', createCanvas: factory.createCanvas
        });
        expect(result).toMatchObject({ width: 960, height: 540, filter: 'infrared', mimeType: 'image/webp' });
        expect(result.blob).toBeInstanceOf(Blob);
        expect(factory.calls.drawImage).toHaveLength(1);
        expect(factory.calls.putImageData).toHaveLength(1);
        expect(factory.calls.encoding).toEqual([{ type: 'image/webp', quality: 0.78 }]);
    });

    it('rejects missing renderers and encoding failures clearly', async () => {
        await expect(captureSkyPhoto(null)).rejects.toThrow(/canvas/i);
        const factory = createCanvasFactory();
        factory.canvas.toBlob = (callback) => callback(null);
        await expect(captureSkyPhoto({ width: 10, height: 10 }, { createCanvas: factory.createCanvas }))
            .rejects.toThrow(/encode/i);
        delete factory.canvas.toBlob;
        await expect(captureSkyPhoto({ width: 10, height: 10 }, { createCanvas: factory.createCanvas }))
            .rejects.toThrow(/encode/i);
    });
});
