export function bindBackdropDismiss(dialog, onDismiss) {
    if (!dialog || typeof onDismiss !== 'function') return () => {};
    const handleClick = (event) => {
        if (event.target !== dialog || event.button !== 0) return;
        onDismiss();
    };
    dialog.addEventListener('click', handleClick);
    return () => dialog.removeEventListener('click', handleClick);
}
