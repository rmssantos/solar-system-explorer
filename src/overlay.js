/**
 * Shared full-screen overlay helper.
 *
 * Every dynamically created overlay gets the same accessibility contract:
 * role="dialog" + aria-modal, focus moved inside on open and restored to the
 * opener on close, Escape to close, Tab trapped inside, click-on-backdrop to
 * close. Styling comes from the .app-overlay class (styles/style.css) so
 * high-contrast mode applies — inline cssText backdrops were immune to it.
 */

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * @param {HTMLElement} contentEl - the dialog content (card/panel)
 * @param {{ className?: string, onClose?: () => void, closeOnBackdrop?: boolean }} [options]
 * @returns {{ overlay: HTMLElement, close: () => void }}
 */
export function showOverlay(contentEl, { className = '', onClose = null, closeOnBackdrop = true } = {}) {
    const overlay = document.createElement('div');
    overlay.className = className ? `app-overlay ${className}` : 'app-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.appendChild(contentEl);

    const opener = document.activeElement;
    let closed = false;

    const close = () => {
        if (closed) return;
        closed = true;
        document.removeEventListener('keydown', onKeydown, true);
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
        if (opener instanceof HTMLElement && document.contains(opener)) {
            opener.focus();
        }
        if (onClose) onClose();
    };

    /** @param {KeyboardEvent} e */
    const onKeydown = (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            close();
            return;
        }
        if (e.key === 'Tab') {
            const focusables = overlay.querySelectorAll(FOCUSABLE);
            if (focusables.length === 0) return;
            const first = /** @type {HTMLElement} */ (focusables[0]);
            const last = /** @type {HTMLElement} */ (focusables[focusables.length - 1]);
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };
    document.addEventListener('keydown', onKeydown, true);

    if (closeOnBackdrop) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    }

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Move focus inside the dialog
    const focusables = overlay.querySelectorAll(FOCUSABLE);
    if (focusables.length > 0) {
        /** @type {HTMLElement} */ (focusables[0]).focus();
    } else {
        overlay.tabIndex = -1;
        overlay.focus();
    }

    return { overlay, close };
}
