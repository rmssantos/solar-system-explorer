import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../paper-preview/src/ui.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../paper-preview/src/main.js', import.meta.url), 'utf8');
const i18n = readFileSync(new URL('../paper-preview/src/i18n/paperI18n.js', import.meta.url), 'utf8');
const COARSE_POINTER_QUERY = /@media\s*\(any-pointer:\s*coarse\)/;

describe('Mobile-first paper flight controls', () => {
    it('provides two labelled touch sticks and complete manoeuvre controls', () => {
        expect(html).toContain('id="flight-joystick"');
        expect(html).toContain('id="flight-look-joystick"');
        expect(html).toContain('id="look-joystick-knob"');
        expect(html).toContain('id="flight-brake"');
        expect(html).toContain('id="flight-roll-left"');
        expect(html).toContain('id="flight-roll-right"');
        expect(html.match(/data-flight-control/g)?.length).toBeGreaterThanOrEqual(8);
        expect(html).toContain('aria-pressed="false"');
        expect(html).toContain('data-i18n-aria="game.flight.boostToggle"');
    });

    it('wires every touch surface into the input controller', () => {
        for (const selector of [
            '#flight-look-joystick', '#look-joystick-knob', '#flight-brake',
            '#flight-roll-left', '#flight-roll-right'
        ]) expect(ui).toContain(selector);
        for (const option of [
            'lookJoystick:', 'lookJoystickKnob:', 'brakeButton:',
            'rollLeftButton:', 'rollRightButton:'
        ]) expect(main).toContain(option);
    });

    it('keeps control gestures out of stage selection', () => {
        expect(main).toContain("closest?.('[data-flight-control]')");
        expect(main).toContain("event.pointerType === 'touch'");
    });

    it('activates for coarse pointers with safe-area-aware thumb zones', () => {
        expect(css).toMatch(COARSE_POINTER_QUERY);
        expect(css).toContain('--touch-stick-size: clamp(112px, 16vw, 128px)');
        expect(css).toContain('--touch-edge-gap-left: max(14px, env(safe-area-inset-left))');
        expect(css).toContain('--touch-edge-gap-right: max(14px, env(safe-area-inset-right))');
        expect(css).toContain('env(safe-area-inset-left)');
        expect(css).toContain('env(safe-area-inset-right)');
        expect(css).toContain('min-width: 52px');
        expect(css).toContain('min-height: 52px');
    });

    it('ships bilingual touch labels and instructions', () => {
        for (const key of [
            'game.flight.move', 'game.flight.look', 'game.flight.brake',
            'game.flight.rollLeft', 'game.flight.rollRight', 'game.flight.boostToggle', 'game.touchControls'
        ]) expect(i18n).toContain(`'${key}'`);
    });
});
