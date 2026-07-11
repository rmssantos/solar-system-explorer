export function createMediaViewer(dialog, { onImageOpen = (_media) => {}, onSourceOpen = (_media) => {} } = {}) {
    if (!dialog?.querySelector) throw new TypeError('A media viewer dialog is required');
    const image = dialog.querySelector('[data-media-image]');
    const caption = dialog.querySelector('[data-media-caption]');
    const source = dialog.querySelector('[data-media-source]');
    const closeButton = dialog.querySelector('[data-media-close]');
    let trigger = null;
    let currentMedia = null;

    function close() {
        if (dialog.open) dialog.close();
        trigger?.focus?.({ preventScroll: true });
        trigger = null;
    }

    function open(media) {
        if (!media?.src) return false;
        currentMedia = media;
        trigger = media.trigger ?? null;
        image.src = media.src;
        image.alt = media.alt ?? '';
        caption.textContent = media.caption ?? '';
        source.hidden = !media.source?.url;
        source.href = media.source?.url ?? '';
        source.textContent = media.source?.name ?? '';
        if (!dialog.open) dialog.showModal();
        onImageOpen(media);
        return true;
    }

    const handleCancel = (event) => { event.preventDefault(); close(); };
    const handleBackdrop = (event) => { if (event.target === dialog) close(); };
    const handleSource = () => { if (currentMedia?.source) onSourceOpen(currentMedia); };
    closeButton.addEventListener('click', close);
    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleBackdrop);
    source.addEventListener('click', handleSource);

    function destroy() {
        closeButton.removeEventListener('click', close);
        dialog.removeEventListener('cancel', handleCancel);
        dialog.removeEventListener('click', handleBackdrop);
        source.removeEventListener('click', handleSource);
    }

    return Object.freeze({ open, close, destroy });
}
