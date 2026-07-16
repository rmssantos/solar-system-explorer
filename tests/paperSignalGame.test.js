import { describe, expect, it } from 'vitest';
import {
    createSignalInputState,
    createSignalCalibrationLayout,
    createSignalLayout,
    readSignalInput,
    readSignalKeyboardInput,
    setSignalAction
} from '../paper-preview/src/minigames/createSignalGame.js';

function key(isDown = false) {
    return { isDown };
}

describe('Mars signal game adapter', () => {
    it('maps the shared controls to angle, frequency and transmission', () => {
        const actions = createSignalInputState();
        setSignalAction(actions, 'forward', true);
        setSignalAction(actions, 'up', true);
        setSignalAction(actions, 'stabilize', true);

        expect(readSignalInput(actions)).toEqual({ horizontal: 1, vertical: -1, transmit: true });
    });

    it('supports WASD, arrows and space', () => {
        expect(readSignalKeyboardInput({
            d: key(false), arrowRight: key(false),
            a: key(true), arrowLeft: key(false),
            w: key(false), arrowUp: key(false),
            s: key(false), arrowDown: key(true),
            transmit: key(true)
        })).toEqual({ horizontal: -1, vertical: 1, transmit: true });
    });

    it('uses a portrait canvas on a tall mobile viewport', () => {
        expect(createSignalLayout(390, 844)).toMatchObject({ orientation: 'portrait', width: 540, height: 960 });
        expect(createSignalLayout(1200, 720)).toMatchObject({ orientation: 'landscape', width: 960, height: 540 });
    });

    it('keeps the calibration card above mobile controls', () => {
        const calibration = createSignalCalibrationLayout(createSignalLayout(390, 844));

        expect(calibration.y).toBeLessThan(430);
        expect(calibration.y + calibration.height / 2).toBeLessThan(450);
    });

    it('keeps the landscape calibration card below the telemetry strip', () => {
        const calibration = createSignalCalibrationLayout(createSignalLayout(844, 390));

        expect(calibration.y).toBeGreaterThan(145);
    });
});
