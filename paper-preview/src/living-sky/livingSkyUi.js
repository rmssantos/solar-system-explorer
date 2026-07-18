import { getLivingSkyEvent } from './livingSkyCatalog.js';

const document = globalThis.document;

/**
 * @template {Element} T
 * @param {string} selector
 * @param {new (...args: any[]) => T} ElementType
 * @returns {T}
 */
function requiredElement(selector, ElementType) {
    const element = document.querySelector(selector);
    if (!(element instanceof ElementType)) throw new Error(`Missing required Living Sky element: ${selector}`);
    return element;
}

/** @param {string} selector @returns {HTMLButtonElement[]} */
function requiredButtons(selector) {
    const buttons = [...document.querySelectorAll(selector)];
    if (!buttons.length || buttons.some((button) => !(button instanceof HTMLButtonElement))) {
        throw new Error(`Missing required Living Sky buttons: ${selector}`);
    }
    return /** @type {HTMLButtonElement[]} */ (buttons);
}

const COPY = Object.freeze({
    pt: Object.freeze({
        trigger: 'Céu vivo', kicker: 'Diorama de observação', title: 'Céu Vivo',
        intro: 'Descobre fenómenos, viaja até ao melhor dia e fotografa-os com o instrumento certo.',
        progress: 'Observações no álbum', active: 'A acontecer', upcoming: 'Próxima janela', complete: 'Fotografado',
        observe: 'Viajar e observar', cameraKicker: 'Instrumento de bordo', cameraTitle: 'Câmara de Explorador',
        visible: 'Visível', infrared: 'Infravermelho', magnetic: 'Campo magnético', closeHint: 'fechar', photoHint: 'fotografia', spaceKey: 'Espaço',
        close: 'Fechar', shutter: 'Tirar fotografia', filterGroup: 'Instrumentos de observação',
        albumKicker: 'Câmara de Explorador', albumTitle: 'Álbum do Céu Vivo',
        albumEmpty: 'Ainda não há fotografias. Abre o Céu Vivo e escolhe uma observação.',
        freePhoto: 'Fotografia livre', delete: 'Apagar fotografia', enlarge: 'Ver fotografia em grande',
        capturing: 'A revelar a fotografia…', ready: 'Alvo centrado. Mantém a nave quieta e fotografa!',
        findTarget: 'Procura o alvo marcado e coloca-o dentro da mira.', centerTarget: 'Move a vista até o alvo ficar no centro.',
        holdSteady: 'Larga o joystick ou prime X para travar e ficar estável.',
        moveBack: 'Estás demasiado perto. Recua com S ou puxa o joystick para baixo.',
        moveCloser: 'Ainda estás longe. Avança com W ou empurra o joystick para cima.',
        useInstrument: 'Agora escolhe o instrumento:', outsideWindow: 'Este fenómeno não está ativo neste dia.',
        freePhotoCoach: 'Podes fotografar livremente; só as janelas ativas dão XP.', saved: 'Fotografia guardada no álbum!',
        qualified: 'Descoberta confirmada e guardada!', failed: 'Boa tentativa. Ajusta a mira e repete quando quiseres.',
        unavailable: 'Não foi possível guardar a imagem, mas podes tentar novamente.'
    }),
    en: Object.freeze({
        trigger: 'Living Sky', kicker: 'Observation diorama', title: 'Living Sky',
        intro: 'Find phenomena, travel to the best day and photograph them with the right instrument.',
        progress: 'Observations in album', active: 'Happening now', upcoming: 'Next window', complete: 'Photographed',
        observe: 'Travel and observe', cameraKicker: 'On-board instrument', cameraTitle: 'Explorer Camera',
        visible: 'Visible', infrared: 'Infrared', magnetic: 'Magnetic field', closeHint: 'close', photoHint: 'photo', spaceKey: 'Space',
        close: 'Close', shutter: 'Take photo', filterGroup: 'Observation instruments',
        albumKicker: 'Explorer Camera', albumTitle: 'Living Sky Album',
        albumEmpty: 'No photos yet. Open Living Sky and choose an observation.',
        freePhoto: 'Free photo', delete: 'Delete photo', enlarge: 'View photo larger',
        capturing: 'Developing the photo…', ready: 'Target centred. Hold the ship steady and take the photo!',
        findTarget: 'Find the marked target and place it inside the sight.', centerTarget: 'Move the view until the target is centred.',
        holdSteady: 'Release the joystick or press X to brake and hold steady.',
        moveBack: 'You are too close. Reverse with S or pull the joystick down.',
        moveCloser: 'You are still far away. Move with W or push the joystick up.',
        useInstrument: 'Now choose the instrument:', outsideWindow: 'This phenomenon is not active on this day.',
        freePhotoCoach: 'You can take a free photo; only active windows award XP.', saved: 'Photo saved to the album!',
        qualified: 'Discovery confirmed and saved!', failed: 'Good try. Adjust the sight and repeat whenever you like.',
        unavailable: 'The image could not be saved, but you can try again.'
    })
});

const FEEDBACK_KEYS = Object.freeze({
    'find-target': 'findTarget', 'center-target': 'centerTarget', 'hold-steady': 'holdSteady',
    'move-back': 'moveBack', 'move-closer': 'moveCloser',
    'outside-window': 'outsideWindow', 'free-photo': 'freePhotoCoach', ready: 'ready'
});

function languageOf(i18n) { return i18n.language === 'en' ? 'en' : 'pt'; }
function text(i18n, key) { return COPY[languageOf(i18n)][key] ?? key; }

/**
 * @param {{
 *   i18n: any,
 *   onObserve?: (eventId: string) => boolean,
 *   onCapture?: (input: { eventId: string | null, filter: string }) => Promise<any>,
 *   onDeletePhoto?: (photoId: string) => Promise<boolean>,
 *   getPhotoUrl?: (storageId: string) => Promise<string | null>,
 *   revokePhotoUrl?: (storageId: string) => boolean
 * }} options
 */
export function createLivingSkyUi({
    i18n,
    onObserve = (_eventId) => false,
    onCapture = async (_input) => false,
    onDeletePhoto = async (_photoId) => false,
    getPhotoUrl = async (_storageId) => null,
    revokePhotoUrl = (_storageId) => false
}) {
    const elements = {
        trigger: requiredElement('#living-sky-trigger', HTMLButtonElement),
        panel: requiredElement('#living-sky-observatory', HTMLElement),
        close: requiredElement('#living-sky-close', HTMLButtonElement),
        list: requiredElement('#living-sky-event-list', HTMLElement),
        progress: requiredElement('#living-sky-progress', HTMLElement),
        disclosure: requiredElement('#living-sky-disclosure', HTMLElement),
        camera: requiredElement('#explorer-camera', HTMLElement),
        cameraClose: requiredElement('#explorer-camera-close', HTMLButtonElement),
        coach: requiredElement('#explorer-camera-coach', HTMLElement),
        shutter: requiredElement('#explorer-camera-shutter', HTMLButtonElement),
        filterGroup: requiredElement('.camera-filters', HTMLElement),
        filterButtons: requiredButtons('[data-camera-filter]'),
        photoGrid: requiredElement('#sky-photo-grid', HTMLElement),
        photoCount: requiredElement('#sky-photo-count', HTMLElement),
        photoEmpty: requiredElement('#sky-photo-empty', HTMLElement),
        viewer: requiredElement('#sky-photo-viewer', HTMLDialogElement),
        viewerClose: requiredElement('#sky-photo-viewer-close', HTMLButtonElement),
        viewerImage: requiredElement('#sky-photo-viewer-image', HTMLImageElement),
        viewerCaption: requiredElement('#sky-photo-viewer-caption', HTMLElement),
        viewerMeta: requiredElement('#sky-photo-viewer-meta', HTMLElement)
    };
    let presentation = null;
    let state = null;
    let filter = 'visible';
    let selectedEventId = null;
    let cameraOpen = false;
    let busy = false;
    let albumSignature = '';
    let eventSignature = '';
    const photoUrls = new Map();
    const inertElements = new Map();
    let previousFocus = null;

    function applyCopy() {
        document.querySelectorAll('[data-living-sky-copy]').forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            node.textContent = text(i18n, node.dataset.livingSkyCopy);
        });
        elements.close.setAttribute('aria-label', `${text(i18n, 'close')} ${text(i18n, 'title')}`);
        elements.cameraClose.setAttribute('aria-label', `${text(i18n, 'close')} ${text(i18n, 'cameraTitle')}`);
        elements.shutter.setAttribute('aria-label', text(i18n, 'shutter'));
        elements.filterGroup.setAttribute('aria-label', text(i18n, 'filterGroup'));
        elements.viewerClose.setAttribute('aria-label', text(i18n, 'close'));
        eventSignature = '';
        renderEvents();
        albumSignature = '';
        renderAlbum();
    }

    function setOpen(open) {
        elements.panel.hidden = !open;
        elements.trigger.setAttribute('aria-expanded', String(open));
        if (open) renderEvents();
    }

    function setBackgroundInert(inert) {
        if (inert) {
            const shell = elements.camera.parentElement;
            const isRequiredGameControl = (node) => ['paper-stage', 'flight-controls'].includes(node.id)
                || node.classList.contains('game-topbar');
            const topbar = shell?.querySelector('.game-topbar');
            const candidates = [
                ...(shell ? [...shell.children].filter((node) => node !== elements.camera && !isRequiredGameControl(node)) : []),
                ...(topbar ? [...topbar.querySelectorAll('a, button')]
                    .filter((node) => !node.matches('[data-language-toggle]')) : []),
                ...[...document.body.children].filter((node) => node !== shell)
            ];
            candidates.forEach((node) => {
                if (!(node instanceof HTMLElement) || inertElements.has(node)) return;
                inertElements.set(node, node.inert);
                node.inert = true;
            });
            return;
        }
        inertElements.forEach((wasInert, node) => { node.inert = wasInert; });
        inertElements.clear();
    }

    function setCameraOpen(open, eventId = selectedEventId) {
        const wasOpen = cameraOpen;
        cameraOpen = Boolean(open);
        selectedEventId = getLivingSkyEvent(eventId)?.id ?? null;
        elements.camera.hidden = !cameraOpen;
        elements.camera.classList.toggle('is-open', cameraOpen);
        document.body.classList.toggle('is-explorer-camera-open', cameraOpen);
        if (cameraOpen && !wasOpen) {
            previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : elements.trigger;
            setBackgroundInert(true);
            elements.coach.textContent = text(i18n, 'findTarget');
            elements.cameraClose.focus();
        } else if (!cameraOpen && wasOpen) {
            setBackgroundInert(false);
            const canRestorePrevious = previousFocus?.isConnected && !elements.panel.contains(previousFocus);
            const focusTarget = canRestorePrevious ? previousFocus : elements.trigger;
            focusTarget.focus();
            previousFocus = null;
        }
        return cameraOpen;
    }

    function setFilter(nextFilter) {
        if (!['visible', 'infrared', 'magnetic'].includes(nextFilter)) return filter;
        filter = nextFilter;
        elements.camera.dataset.filter = filter;
        elements.filterButtons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.cameraFilter === filter));
        });
        return filter;
    }

    function formatDate(dateMs) {
        return new Intl.DateTimeFormat(languageOf(i18n) === 'en' ? 'en-GB' : 'pt-PT', {
            day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
        }).format(new Date(dateMs));
    }

    function renderEvents() {
        if (!presentation || !state) return;
        const completed = new Set(state.completedEventIds);
        const signature = `${languageOf(i18n)}:${[...completed].join(',')}:${presentation.allEvents
            .map((event) => `${event.id}:${event.window.active}:${event.window.startMs}`).join('|')}`;
        if (signature === eventSignature) return;
        eventSignature = signature;
        elements.progress.textContent = `${completed.size}/4`;
        elements.disclosure.textContent = presentation.simulationDisclosure;
        const cards = presentation.allEvents.map((event, index) => {
            const done = completed.has(event.id);
            const card = document.createElement('article');
            card.className = `living-sky-card${done ? ' is-complete' : ''}`;
            card.style.setProperty('--card-tilt', `${index % 2 ? 0.25 : -0.25}deg`);
            const img = document.createElement('img'); img.src = event.art; img.alt = ''; img.width = 192; img.height = 192;
            const copy = document.createElement('div'); copy.className = 'living-sky-card-copy';
            const kicker = document.createElement('small'); kicker.textContent = event.kicker;
            const title = document.createElement('strong'); title.textContent = event.title;
            const summary = document.createElement('p'); summary.textContent = event.short;
            const meta = document.createElement('div'); meta.className = 'living-sky-card-meta';
            const status = document.createElement('span'); status.textContent = done
                ? `✓ ${text(i18n, 'complete')}`
                : (event.window.active ? text(i18n, 'active') : `${text(i18n, 'upcoming')}: ${formatDate(event.window.startMs)}`);
            const xp = document.createElement('span'); xp.textContent = `+${event.rewardXp} XP`;
            meta.append(status, xp);
            const button = document.createElement('button'); button.type = 'button'; button.dataset.livingSkyObserve = event.id; button.textContent = text(i18n, 'observe');
            copy.append(kicker, title, summary, meta, button); card.append(img, copy); return card;
        });
        elements.list.replaceChildren(...cards);
    }

    async function renderAlbum() {
        if (!state) return;
        const activePhotos = new Map(state.photoRecords.map((record) => [record.id, record.storageId ?? record.id]));
        photoUrls.forEach((cached, photoId) => {
            if (activePhotos.get(photoId) === cached.storageId) return;
            revokePhotoUrl(cached.storageId);
            photoUrls.delete(photoId);
        });
        const signature = `${languageOf(i18n)}:${state.photoRecords.map((record) => `${record.id}:${record.score}`).join('|')}`;
        if (signature === albumSignature) return;
        albumSignature = signature;
        elements.photoCount.textContent = `${state.photoRecords.length}/12`;
        elements.photoEmpty.hidden = state.photoRecords.length > 0;
        const cards = await Promise.all([...state.photoRecords].reverse().map(async (record, index) => {
            const event = getLivingSkyEvent(record.eventId);
            const localized = event?.copy[languageOf(i18n)] ?? null;
            const storageId = record.storageId ?? record.id;
            let url = photoUrls.get(record.id)?.url;
            if (!url) {
                url = await getPhotoUrl(storageId);
                const stillActive = state?.photoRecords.some((photo) => photo.id === record.id
                    && (photo.storageId ?? photo.id) === storageId);
                if (url && stillActive) photoUrls.set(record.id, { storageId, url });
                else if (url) revokePhotoUrl(storageId);
            }
            const card = document.createElement('figure'); card.className = 'sky-photo-card'; card.dataset.photoId = record.id;
            card.style.setProperty('--photo-tilt', `${index % 2 ? 0.45 : -0.45}deg`);
            const open = document.createElement('button'); open.type = 'button'; open.dataset.skyPhotoOpen = record.id; open.setAttribute('aria-label', text(i18n, 'enlarge'));
            const img = document.createElement('img'); img.src = url || event?.art || ''; img.alt = localized?.title ?? text(i18n, 'freePhoto'); img.loading = 'lazy'; open.append(img);
            const caption = document.createElement('figcaption');
            const title = document.createElement('strong'); title.textContent = localized?.title ?? text(i18n, 'freePhoto');
            const meta = document.createElement('span'); meta.textContent = `${Math.round(record.score * 100)}% · ${text(i18n, record.filter)}`;
            caption.append(title, meta);
            const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'sky-photo-delete'; remove.dataset.skyPhotoDelete = record.id; remove.setAttribute('aria-label', text(i18n, 'delete')); remove.textContent = '×';
            card.append(open, caption, remove); return card;
        }));
        if (signature === albumSignature) elements.photoGrid.replaceChildren(...cards);
    }

    function update(nextPresentation, nextState) {
        presentation = nextPresentation;
        state = nextState;
        renderEvents();
        renderAlbum();
    }

    function updateTelemetry(assessment) {
        if (!cameraOpen || busy || !assessment) return;
        if (assessment.feedback === 'try-instrument') {
            const preferredFilter = getLivingSkyEvent(assessment.eventId)?.preferredFilter ?? 'visible';
            elements.coach.textContent = `${text(i18n, 'useInstrument')} ${text(i18n, preferredFilter)}.`;
        } else {
            elements.coach.textContent = text(i18n, FEEDBACK_KEYS[assessment.feedback] ?? 'findTarget');
        }
        elements.camera.dataset.ready = String(Boolean(assessment.qualified));
    }

    async function capture() {
        if (!cameraOpen || busy) return false;
        busy = true; elements.shutter.disabled = true; elements.coach.textContent = text(i18n, 'capturing');
        elements.camera.classList.remove('is-flashing'); void elements.camera.offsetWidth; elements.camera.classList.add('is-flashing');
        try {
            const result = await onCapture({ eventId: selectedEventId, filter });
            elements.coach.textContent = text(i18n, result?.qualified ? 'qualified' : (result ? 'failed' : 'unavailable'));
            return result;
        } finally {
            busy = false; elements.shutter.disabled = false;
        }
    }

    elements.trigger.addEventListener('click', () => setOpen(elements.panel.hidden));
    elements.close.addEventListener('click', () => setOpen(false));
    elements.cameraClose.addEventListener('click', () => setCameraOpen(false));
    elements.shutter.addEventListener('click', capture);
    elements.filterButtons.forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.cameraFilter)));
    elements.list.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest('[data-living-sky-observe]');
        if (!(button instanceof HTMLButtonElement)) return;
        selectedEventId = button.dataset.livingSkyObserve;
        if (onObserve(selectedEventId) !== false) { setOpen(false); setCameraOpen(true, selectedEventId); }
    });
    elements.photoGrid.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;
        const remove = event.target.closest('[data-sky-photo-delete]');
        if (remove instanceof HTMLButtonElement) { onDeletePhoto(remove.dataset.skyPhotoDelete); return; }
        const open = event.target.closest('[data-sky-photo-open]');
        if (!(open instanceof HTMLButtonElement)) return;
        const record = state?.photoRecords.find((item) => item.id === open.dataset.skyPhotoOpen);
        const cardImage = open.querySelector('img');
        if (!record || !cardImage) return;
        const skyEvent = getLivingSkyEvent(record.eventId);
        elements.viewerImage.src = cardImage.src;
        elements.viewerImage.alt = cardImage.alt;
        elements.viewerCaption.textContent = skyEvent?.copy[languageOf(i18n)]?.title ?? text(i18n, 'freePhoto');
        elements.viewerMeta.textContent = `${Math.round(record.score * 100)}% · ${text(i18n, record.filter)}`;
        elements.viewer.showModal();
    });
    elements.viewerClose.addEventListener('click', () => elements.viewer.close());
    elements.viewer.addEventListener('click', (event) => { if (event.target === elements.viewer) elements.viewer.close(); });
    elements.camera.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const controls = /** @type {HTMLButtonElement[]} */ ([...elements.camera.querySelectorAll('button:not(:disabled)')]
            .filter((node) => node instanceof HTMLButtonElement && !node.hidden));
        if (!controls.length) return;
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    const unsubscribe = i18n.subscribe(applyCopy);
    applyCopy(); setFilter('visible');

    function destroy() {
        unsubscribe();
        setBackgroundInert(false);
        document.body.classList.remove('is-explorer-camera-open');
        photoUrls.forEach((cached) => revokePhotoUrl(cached.storageId));
        photoUrls.clear();
    }
    return { elements, update, updateTelemetry, setOpen, setCameraOpen, setFilter, capture, getState: () => ({ cameraOpen, filter, selectedEventId, busy }), destroy };
}
