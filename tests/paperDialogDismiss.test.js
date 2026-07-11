import { describe, expect, it, vi } from 'vitest';
import { bindBackdropDismiss } from '../paper-preview/src/ui/dialogDismiss.js';

function fakeDialog() {
    const listeners = new Map();
    return {
        addEventListener(type, handler) { listeners.set(type, handler); },
        removeEventListener(type) { listeners.delete(type); },
        click(target, button = 0) { listeners.get('click')?.({ target, button }); },
        has(type) { return listeners.has(type); }
    };
}

describe('paper dialog backdrop dismissal', () => {
    it('dismisses only a primary click on the dialog backdrop', () => {
        const dialog = fakeDialog();
        const dismiss = vi.fn();
        const unbind = bindBackdropDismiss(dialog, dismiss);

        dialog.click({ inside: true });
        dialog.click(dialog, 2);
        expect(dismiss).not.toHaveBeenCalled();

        dialog.click(dialog, 0);
        expect(dismiss).toHaveBeenCalledOnce();

        unbind();
        expect(dialog.has('click')).toBe(false);
    });
});
