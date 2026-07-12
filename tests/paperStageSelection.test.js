import { describe, expect, it } from 'vitest';
import { createStageSelectionGesture } from '../paper-preview/src/input/stageSelection.js';

const pointer = (pointerId, clientX, clientY, pointerType = 'touch') => ({
    pointerId, clientX, clientY, pointerType
});

describe('stage selection gesture', () => {
    it('selects a single tap but rejects a drag', () => {
        const gesture = createStageSelectionGesture();

        gesture.pointerDown(pointer(1, 20, 20));
        expect(gesture.pointerUp(pointer(1, 20, 20))).toBe(true);

        gesture.pointerDown(pointer(2, 20, 20));
        expect(gesture.pointerMove(pointer(2, 50, 20))).toBe(true);
        expect(gesture.pointerUp(pointer(2, 50, 20))).toBe(false);
    });

    it('suppresses selection until every pointer in a multi-touch gesture is released', () => {
        const gesture = createStageSelectionGesture();

        gesture.pointerDown(pointer(1, 30, 30));
        gesture.pointerDown(pointer(2, 90, 30));
        gesture.pointerMove(pointer(1, 10, 30));

        expect(gesture.pointerUp(pointer(1, 10, 30))).toBe(false);
        expect(gesture.pointerUp(pointer(2, 90, 30))).toBe(false);

        gesture.pointerDown(pointer(3, 40, 40));
        expect(gesture.pointerUp(pointer(3, 40, 40))).toBe(true);
    });

    it('never selects a cancelled pointer', () => {
        const gesture = createStageSelectionGesture();

        gesture.pointerDown(pointer(1, 30, 30));
        gesture.pointerCancel(pointer(1, 30, 30));

        expect(gesture.pointerUp(pointer(1, 30, 30))).toBe(false);
    });
});
