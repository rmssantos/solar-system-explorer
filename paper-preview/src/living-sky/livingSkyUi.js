import { getLivingSkyEvent } from './livingSkyCatalog.js';

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
        holdSteady: 'Abranda ou trava: a câmara precisa de ficar estável.', adjustDistance: 'Aproxima-te um pouco do alvo.',
        tryInstrument: 'Experimenta outro instrumento: a pista está nos filtros.', outsideWindow: 'Este fenómeno não está ativo neste dia.',
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
        holdSteady: 'Slow down or brake: the camera needs a steady ship.', adjustDistance: 'Move a little closer to the target.',
        tryInstrument: 'Try another instrument: the clue is in the filters.', outsideWindow: 'This phenomenon is not active on this day.',
        freePhotoCoach: 'You can take a free photo; only active windows award XP.', saved: 'Photo saved to the album!',
        qualified: 'Discovery confirmed and saved!', failed: 'Good try. Adjust the sight and repeat whenever you like.',
        unavailable: 'The image could not be saved, but you can try again.'
    })
});

const FEEDBACK_KEYS = Object.freeze({
    'find-target': 'findTarget', 'center-target': 'centerTarget', 'hold-steady': 'holdSteady',
    'adjust-distance': 'adjustDistance', 'try-instrument': 'tryInstrument',
    'outside-window': 'outsideWindow', 'free-photo': 'freePhotoCoach', ready: 'ready'
});

function languageOf(i18n) { return i18n.language === 'en' ? 'en' : 'pt'; }
function text(i18n, key) { return COPY[languageOf(i18n)][key] ?? key; }

export function createLivingSkyUi({
    i18n,
    onObserve = () => false,
    onCapture = () => false,
    onDeletePhoto = () => false,
    getPhotoUrl = () => null
}) {
    const elements = {
        trigger: document.querySelector('#living-sky-trigger'),
        panel: document.querySelector('#living-sky-observatory'),
        close: document.querySelector('#living-sky-close'),
        list: document.querySelector('#living-sky-event-list'),
        progress: document.querySelector('#living-sky-progress'),
        disclosure: document.querySelector('#living-sky-disclosure'),
        camera: document.querySelector('#explorer-camera'),
        cameraClose: document.querySelector('#explorer-camera-close'),
        coach: document.querySelector('#explorer-camera-coach'),
        shutter: document.querySelector('#explorer-camera-shutter'),
        filterGroup: document.querySelector('.camera-filters'),
        filterButtons: [...document.querySelectorAll('[data-camera-filter]')],
        photoGrid: document.querySelector('#sky-photo-grid'),
        photoCount: document.querySelector('#sky-photo-count'),
        photoEmpty: document.querySelector('#sky-photo-empty'),
        viewer: document.querySelector('#sky-photo-viewer'),
        viewerClose: document.querySelector('#sky-photo-viewer-close'),
        viewerImage: document.querySelector('#sky-photo-viewer-image'),
        viewerCaption: document.querySelector('#sky-photo-viewer-caption'),
        viewerMeta: document.querySelector('#sky-photo-viewer-meta')
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

    function applyCopy() {
        document.querySelectorAll('[data-living-sky-copy]').forEach((node) => {
            node.textContent = text(i18n, node.dataset.livingSkyCopy);
        });
        elements.camera.setAttribute('aria-label', text(i18n, 'cameraTitle'));
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

    function setCameraOpen(open, eventId = selectedEventId) {
        cameraOpen = Boolean(open);
        selectedEventId = getLivingSkyEvent(eventId)?.id ?? null;
        elements.camera.hidden = !cameraOpen;
        elements.camera.classList.toggle('is-open', cameraOpen);
        document.body.classList.toggle('is-explorer-camera-open', cameraOpen);
        if (cameraOpen) elements.coach.textContent = text(i18n, 'findTarget');
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
        const signature = `${languageOf(i18n)}:${state.photoRecords.map((record) => `${record.id}:${record.score}`).join('|')}`;
        if (signature === albumSignature) return;
        albumSignature = signature;
        elements.photoCount.textContent = `${state.photoRecords.length}/12`;
        elements.photoEmpty.hidden = state.photoRecords.length > 0;
        const cards = await Promise.all([...state.photoRecords].reverse().map(async (record, index) => {
            const event = getLivingSkyEvent(record.eventId);
            const localized = event?.copy[languageOf(i18n)] ?? null;
            let url = photoUrls.get(record.id);
            if (!url) {
                url = await getPhotoUrl(record.storageId ?? record.id);
                if (url) photoUrls.set(record.id, url);
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
        elements.coach.textContent = text(i18n, FEEDBACK_KEYS[assessment.feedback] ?? 'findTarget');
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
        const button = event.target.closest('[data-living-sky-observe]');
        if (!button) return;
        selectedEventId = button.dataset.livingSkyObserve;
        if (onObserve(selectedEventId) !== false) { setOpen(false); setCameraOpen(true, selectedEventId); }
    });
    elements.photoGrid.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-sky-photo-delete]');
        if (remove) { onDeletePhoto(remove.dataset.skyPhotoDelete); return; }
        const open = event.target.closest('[data-sky-photo-open]');
        if (!open) return;
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
    const unsubscribe = i18n.subscribe(applyCopy);
    applyCopy(); setFilter('visible');

    function destroy() { unsubscribe(); document.body.classList.remove('is-explorer-camera-open'); photoUrls.clear(); }
    return { elements, update, updateTelemetry, setOpen, setCameraOpen, setFilter, capture, getState: () => ({ cameraOpen, filter, selectedEventId, busy }), destroy };
}
