import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../paper-preview/src/ui.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../paper-preview/src/main.js', import.meta.url), 'utf8');
const i18n = readFileSync(new URL('../paper-preview/src/i18n/paperI18n.js', import.meta.url), 'utf8');
const COARSE_POINTER_QUERY = /@media\s*\(any-pointer:\s*coarse\)/;
const GAME_TOPBAR_REGEX = /<header class="game-topbar">([\s\S]*?)<\/header>/;
const EXPERIENCE_HEADER_REGEX = /<header class="experience-header">([\s\S]*?)<\/header>/;
const SHORT_LANDSCAPE_ZOOM_REGEX = /@media \(max-height: 520px\) and \(orientation: landscape\)[\s\S]*?\.zoom-controls\s*\{[^}]*right:\s*50%;[^}]*display:\s*flex;[^}]*transform:\s*translateX\(50%\)/;

describe('Mobile-first paper flight controls', () => {
    it('provides exactly two labelled touch sticks without redundant manoeuvre buttons', () => {
        expect(html).toContain('id="flight-joystick"');
        expect(html).toContain('id="flight-look-joystick"');
        expect(html).toContain('id="look-joystick-knob"');
        expect(html.match(/data-flight-control/g)).toHaveLength(2);
        expect(html).not.toContain('class="flight-actions"');
        for (const id of [
            'flight-roll-left', 'flight-up', 'flight-roll-right',
            'flight-brake', 'flight-down', 'flight-boost'
        ]) expect(html).not.toContain(`id="${id}"`);
    });

    it('wires only the two touch sticks into the input controller', () => {
        for (const selector of ['#flight-joystick', '#flight-look-joystick', '#look-joystick-knob']) {
            expect(ui).toContain(selector);
        }
        for (const removedSelector of [
            '#flight-up', '#flight-down', '#flight-boost', '#flight-brake',
            '#flight-roll-left', '#flight-roll-right'
        ]) expect(ui).not.toContain(removedSelector);
        for (const option of ['lookJoystick:', 'lookJoystickKnob:']) expect(main).toContain(option);
        for (const removedOption of [
            'upButton:', 'downButton:', 'boostButton:', 'brakeButton:',
            'rollLeftButton:', 'rollRightButton:'
        ]) expect(main).not.toContain(removedOption);
    });

    it('groups primary routes, language, and notebook in one safe top bar', () => {
        const topbar = html.match(GAME_TOPBAR_REGEX)?.[1] ?? '';
        expect(topbar).toContain('class="game-route-nav"');
        expect(topbar).toContain('class="game-home-link"');
        expect(topbar).toContain('class="game-library-link"');
        expect(topbar).toContain('class="game-language-toggle"');
        expect(topbar).toContain('id="notebook-trigger"');
        expect(css).toContain('padding-top: env(safe-area-inset-top)');
        expect(css).toContain('--touch-target-min: 44px');
    });

    it('composes mission, rank, and direction as one compact mobile HUD region', () => {
        const header = html.match(EXPERIENCE_HEADER_REGEX)?.[1] ?? '';
        expect(header).toContain('class="mission-status-cluster"');
        expect(header).toContain('id="objective-chip"');
        expect(header).toContain('id="rank-chip"');
        expect(header).toContain('id="nav-beacon"');
        expect(css).toContain('@media (max-height: 520px) and (orientation: landscape)');
        expect(css).toContain('@media (min-width: 721px) and (any-pointer: coarse)');
    });

    it('moves the tool rail away from the look stick on short landscape screens', () => {
        expect(css).toMatch(SHORT_LANDSCAPE_ZOOM_REGEX);
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
        expect(css).toContain('min-width: var(--touch-target-min)');
        expect(css).toContain('min-height: var(--touch-target-min)');
    });

    it('ships bilingual touch labels and instructions', () => {
        for (const key of ['game.flight.move', 'game.flight.look', 'game.touchControls']) {
            expect(i18n).toContain(`'${key}'`);
        }
    });
});
