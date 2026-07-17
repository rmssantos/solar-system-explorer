import {
    advanceScienceSimulation,
    applyScienceAction,
    createScienceSimulation,
    getScienceTarget
} from './scienceSimulation.js';

const PAPER_TEXTURES = Object.freeze({
    craft: '/art/textures/paper-craft-surface.webp',
    sun: '/art/textures/paper-sun-surface.webp',
    earth: '/art/textures/paper-earth-surface.webp',
    mars: '/art/textures/paper-mars-surface.webp',
    rocky: '/art/textures/paper-rocky-surface.webp'
});

function seededWave(seed, index) {
    const value = Math.sin((seed + index * 91.17) * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

export function createPaperArtAtlas(view, onLoad = () => {}) {
    const atlas = {};
    if (typeof view?.Image !== 'function') return atlas;
    for (const [key, source] of Object.entries(PAPER_TEXTURES)) {
        const image = new view.Image();
        image.decoding = 'async';
        image.addEventListener('load', onLoad, { once: true });
        image.src = source;
        atlas[key] = image;
    }
    return atlas;
}

function traceCutCircle(context, x, y, radius, seed = 0, points = 44) {
    context.beginPath();
    for (let index = 0; index <= points; index += 1) {
        const angle = index / points * Math.PI * 2;
        const wobble = 1 + (seededWave(seed, index) - .5) * .075;
        const pointX = x + Math.cos(angle) * radius * wobble;
        const pointY = y + Math.sin(angle) * radius * wobble;
        if (index === 0) context.moveTo(pointX, pointY); else context.lineTo(pointX, pointY);
    }
    context.closePath();
}

function drawTexture(context, image, x, y, width, height, alpha = .72) {
    if (!image?.complete || !image.naturalWidth) return;
    context.save();
    context.globalAlpha = alpha;
    context.drawImage(image, x, y, width, height);
    context.restore();
}

export function drawPaperBackdrop(context, width, height, seed, art, time = 0) {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a1533');
    gradient.addColorStop(.52, '#172b52');
    gradient.addColorStop(1, '#09132d');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    drawTexture(context, art.craft, 0, 0, width, height, .16);

    context.save();
    context.globalCompositeOperation = 'screen';
    for (let index = 0; index < 68; index += 1) {
        const x = seededWave(seed, index * 2) * width;
        const y = seededWave(seed, index * 2 + 1) * height;
        const pulse = .55 + Math.sin(time / 430 + index) * .25;
        const size = index % 13 === 0 ? 3.5 : index % 5 === 0 ? 2 : 1;
        context.globalAlpha = Math.max(.18, pulse);
        context.fillStyle = index % 7 === 0 ? '#9fd5e7' : '#fff0c4';
        if (index % 13 === 0) {
            context.save();
            context.translate(x, y);
            context.rotate(Math.PI / 4);
            context.fillRect(-size / 2, -size / 2, size, size);
            context.restore();
        } else context.fillRect(x, y, size, size);
    }
    context.restore();

    context.save();
    context.strokeStyle = 'rgb(234 216 168 / .2)';
    context.lineWidth = 2;
    context.setLineDash([2, 10]);
    context.strokeRect(12, 12, width - 24, height - 24);
    context.restore();
}

export function drawPaperPlanet(context, art, options) {
    const { x, y, radius, texture = 'earth', color = '#4388b8', seed = 1, rotation = 0 } = options;
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.translate(-x, -y);
    context.fillStyle = 'rgb(3 8 24 / .48)';
    traceCutCircle(context, x + radius * .09, y + radius * .12, radius, seed);
    context.fill();
    context.fillStyle = color;
    traceCutCircle(context, x, y, radius, seed);
    context.fill();
    context.save();
    traceCutCircle(context, x, y, radius, seed);
    context.clip();
    drawTexture(context, art[texture], x - radius, y - radius, radius * 2, radius * 2, .9);
    const shine = context.createRadialGradient(x - radius * .35, y - radius * .4, 1, x, y, radius * 1.05);
    shine.addColorStop(0, 'rgb(255 249 216 / .5)');
    shine.addColorStop(.5, 'rgb(255 249 216 / .06)');
    shine.addColorStop(1, 'rgb(5 9 26 / .45)');
    context.fillStyle = shine;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    context.restore();
    context.strokeStyle = '#080f25';
    context.lineWidth = Math.max(3, radius * .035);
    traceCutCircle(context, x, y, radius, seed);
    context.stroke();
    context.strokeStyle = 'rgb(255 240 196 / .55)';
    context.lineWidth = 1.5;
    traceCutCircle(context, x - 2, y - 2, radius * .93, seed + 7);
    context.stroke();
    context.restore();
}

function drawProbe(context, art, x, y, angle = 0, flame = false, time = 0) {
    const scale = Math.max(.72, Math.min(1.16, context.canvas.clientWidth / 900 || 1));
    context.save();
    context.translate(x + 5, y + 7);
    context.rotate(angle);
    context.scale(scale, scale);
    context.fillStyle = 'rgb(2 7 20 / .5)';
    context.fillRect(-49, -12, 98, 27);
    context.restore();

    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.scale(scale, scale);
    context.fillStyle = '#4388b8';
    context.strokeStyle = '#080f25';
    context.lineWidth = 3;
    for (const side of [-1, 1]) {
        const panelX = side < 0 ? -52 : 27;
        context.fillRect(panelX, -12, 25, 24);
        context.strokeRect(panelX, -12, 25, 24);
        context.strokeStyle = 'rgb(255 240 196 / .45)';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(panelX + 8, -11); context.lineTo(panelX + 8, 11);
        context.moveTo(panelX + 16, -11); context.lineTo(panelX + 16, 11);
        context.stroke();
        context.strokeStyle = '#080f25'; context.lineWidth = 3;
    }
    context.fillStyle = '#ead8a8';
    context.beginPath();
    context.moveTo(-24, -13); context.lineTo(20, -10); context.lineTo(24, 10);
    context.lineTo(-19, 14); context.lineTo(-27, 3); context.closePath();
    context.fill(); context.stroke();
    context.save();
    context.clip();
    drawTexture(context, art.craft, -27, -14, 54, 29, .72);
    context.restore();
    context.fillStyle = '#f5b83d';
    context.beginPath(); context.arc(1, 0, 6, 0, Math.PI * 2); context.fill(); context.stroke();
    context.beginPath(); context.moveTo(14, -11); context.lineTo(25, -30); context.stroke();
    context.fillStyle = '#fff0c4'; context.beginPath(); context.arc(27, -32, 5, 0, Math.PI * 2); context.fill(); context.stroke();
    if (flame) {
        const flicker = 8 + Math.sin(time / 45) * 4;
        context.fillStyle = '#f5b83d';
        context.beginPath(); context.moveTo(-27, -8); context.lineTo(-51 - flicker, 0); context.lineTo(-27, 8); context.fill();
        context.fillStyle = '#d85d4a';
        context.beginPath(); context.moveTo(-27, -5); context.lineTo(-42 - flicker, 0); context.lineTo(-27, 5); context.fill();
    }
    context.restore();
}

export function drawExhaustParticles(context, state, width, height) {
    const progress = state.launchProgress;
    const point = trajectoryPoint(progress, width, height);
    const previous = trajectoryPoint(Math.max(0, progress - .03), width, height);
    const angle = Math.atan2(point.y - previous.y, point.x - previous.x);
    for (let index = 0; index < 15; index += 1) {
        const phase = ((state.elapsedMs / 13 + index * 19) % 100) / 100;
        const distance = 18 + phase * 92;
        const drift = Math.sin(index * 4.2 + state.elapsedMs / 120) * 13 * phase;
        const x = point.x - Math.cos(angle) * distance - Math.sin(angle) * drift;
        const y = point.y - Math.sin(angle) * distance + Math.cos(angle) * drift;
        context.globalAlpha = (1 - phase) * .82;
        context.fillStyle = index % 3 === 0 ? '#d85d4a' : index % 2 === 0 ? '#f5b83d' : '#fff0c4';
        traceCutCircle(context, x, y, 2 + (1 - phase) * 5, state.seed + index, 8);
        context.fill();
    }
    context.globalAlpha = 1;
}

function trajectoryPoint(progress, width, height) {
    const start = { x: width * .12, y: height * .78 };
    const control = { x: width * .43, y: height * .08 };
    const end = { x: width * .86, y: height * .36 };
    const inverse = 1 - progress;
    return {
        x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
        y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y
    };
}

export function drawLaunch(context, state, width, height, art = {}) {
    drawPaperPlanet(context, art, { x: width * .08, y: height * .84, radius: height * .17, texture: 'earth', color: '#4388b8', seed: state.seed });
    context.strokeStyle = 'rgb(245 184 61 / .78)';
    context.lineWidth = 4;
    context.setLineDash([7, 10]);
    context.beginPath();
    for (let index = 0; index <= 40; index += 1) {
        const point = trajectoryPoint(index / 40, width, height);
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
    }
    context.stroke();
    context.setLineDash([]);
    const point = trajectoryPoint(state.launchProgress, width, height);
    const next = trajectoryPoint(Math.min(1, state.launchProgress + .01), width, height);
    drawExhaustParticles(context, state, width, height);
    drawProbe(context, art, point.x, point.y, Math.atan2(next.y - point.y, next.x - point.x), true, state.elapsedMs);
}

export function drawSignalRibbons(context, startX, startY, endX, endY, strength, time, color = '#9fd5e7') {
    const distance = Math.hypot(endX - startX, endY - startY);
    const angle = Math.atan2(endY - startY, endX - startX);
    context.save();
    context.translate(startX, startY);
    context.rotate(angle);
    for (let ribbon = -1; ribbon <= 1; ribbon += 1) {
        context.beginPath();
        for (let index = 0; index <= 44; index += 1) {
            const progress = index / 44;
            const x = progress * distance;
            const fade = Math.sin(progress * Math.PI);
            const y = ribbon * 14 + Math.sin(progress * Math.PI * 7 - time / 230 + ribbon) * (5 + strength * 10) * fade;
            if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.globalAlpha = .2 + strength * (.28 + (ribbon === 0 ? .3 : .12));
        context.strokeStyle = color;
        context.lineWidth = ribbon === 0 ? 5 : 2;
        context.stroke();
    }
    context.restore();
    context.globalAlpha = 1;
}

export function drawSolar(context, state, width, height, art = {}) {
    const target = getScienceTarget(state).scan;
    const targetX = width * (.12 + target * .78);
    const scanX = width * (.12 + state.scan * .78);
    const pulse = 1 + Math.sin(state.scienceElapsedMs / 180) * .035;
    const gradient = context.createRadialGradient(width * .12, height * .5, 8, width * .12, height * .5, height * .34);
    gradient.addColorStop(0, '#fff4b0');
    gradient.addColorStop(.45, '#f5b83d');
    gradient.addColorStop(1, 'rgb(216 93 74 / 0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(width * .12, height * .5, height * .34, 0, Math.PI * 2);
    context.fill();
    drawPaperPlanet(context, art, { x: width * .12, y: height * .5, radius: height * .205 * pulse, texture: 'sun', color: '#f5b83d', seed: state.seed, rotation: state.scienceElapsedMs / 12000 });
    context.fillStyle = 'rgb(107 152 91 / .22)';
    context.fillRect(targetX - width * .025, height * .12, width * .05, height * .76);
    context.strokeStyle = '#9fd5e7';
    context.lineWidth = 4;
    context.beginPath();
    for (let index = 0; index <= 90; index += 1) {
        const x = width * (.12 + index / 90 * .78);
        const envelope = Math.exp(-Math.pow(index / 90 - target, 2) / .012);
        const y = height * .5 + Math.sin(index * .72) * height * (.035 + envelope * .14);
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.stroke();
    drawSignalRibbons(context, width * .22, height * .5, width * .83, height * .23, .72, state.scienceElapsedMs, '#d85d4a');
    context.strokeStyle = '#fff5ce';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(scanX, height * .1);
    context.lineTo(scanX, height * .9);
    context.stroke();
    drawProbe(context, art, width * .87, height * .2 + Math.sin(state.scienceElapsedMs / 380) * 4, -.18, false, state.scienceElapsedMs);
}

export function drawNeo(context, state, width, height, art = {}) {
    const target = getScienceTarget(state);
    const asteroid = { x: target.x * width, y: target.y * height };
    context.strokeStyle = 'rgb(245 184 61 / .55)';
    context.lineWidth = 2;
    context.setLineDash([5, 9]);
    context.beginPath();
    context.ellipse(width * .5, height * .5, width * .4, height * .28, -.2, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
    drawPaperPlanet(context, art, { x: width * .84, y: height * .72, radius: height * .15, texture: 'earth', color: '#4388b8', seed: state.seed + 11, rotation: -.08 });
    drawPaperPlanet(context, art, { x: asteroid.x, y: asteroid.y, radius: Math.max(25, height * .065), texture: 'rocky', color: '#b59468', seed: state.seed + 23, rotation: state.scienceElapsedMs / 1600 });
    context.strokeStyle = 'rgb(216 93 74 / .34)';
    context.lineWidth = 2;
    for (let trail = 1; trail <= 3; trail += 1) {
        context.beginPath();
        context.moveTo(asteroid.x - 30 - trail * 8, asteroid.y + trail * 5);
        context.lineTo(asteroid.x - 72 - trail * 18, asteroid.y + trail * 11);
        context.stroke();
    }
    const aimX = state.aim.x * width;
    const aimY = state.aim.y * height;
    context.strokeStyle = '#fff5ce';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(aimX, aimY, 34, 0, Math.PI * 2);
    context.moveTo(aimX - 48, aimY); context.lineTo(aimX - 18, aimY);
    context.moveTo(aimX + 18, aimY); context.lineTo(aimX + 48, aimY);
    context.moveTo(aimX, aimY - 48); context.lineTo(aimX, aimY - 18);
    context.moveTo(aimX, aimY + 18); context.lineTo(aimX, aimY + 48);
    context.stroke();
    context.strokeStyle = state.focusProgress >= .75 ? '#b9d798' : '#f5b83d';
    context.lineWidth = 7;
    context.beginPath();
    context.arc(aimX, aimY, 42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * state.focusProgress);
    context.stroke();
}

export function drawMars(context, state, width, height, art = {}) {
    drawPaperPlanet(context, art, { x: width * .78, y: height * .52, radius: height * .235, texture: 'mars', color: '#d85d4a', seed: state.seed, rotation: state.scienceElapsedMs / 17000 });
    drawProbe(context, art, width * .2, height * .5 + Math.sin(state.scienceElapsedMs / 420) * 4, 0, false, state.scienceElapsedMs);
    drawSignalRibbons(context, width * .25, height * .5, width * .62, height * .5, state.signalStrength, state.scienceElapsedMs, '#9fd5e7');
    context.strokeStyle = '#f5b83d';
    context.lineWidth = 10;
    context.beginPath();
    context.arc(width * .5, height * .86, width * .12, Math.PI, Math.PI + Math.PI * state.lockProgress);
    context.stroke();
    context.fillStyle = '#fff0c4';
    context.font = `900 ${Math.max(12, height * .035)}px monospace`;
    context.textAlign = 'center';
    context.fillText(`${Math.round(state.signalStrength * 100)}%`, width * .5, height * .86 - 8);
}

export function drawCaptureFlash(context, width, height, effects) {
    if (effects.captureFlash <= 0) return;
    const alpha = Math.min(.72, effects.captureFlash * .72);
    context.fillStyle = `rgb(255 240 196 / ${alpha})`;
    context.fillRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
    context.strokeStyle = `rgb(245 184 61 / ${effects.captureFlash})`;
    context.lineWidth = 5;
    for (let index = 0; index < 14; index += 1) {
        context.rotate(Math.PI * 2 / 14);
        context.beginPath(); context.moveTo(48, 0); context.lineTo(72 + effects.captureFlash * 45, 0); context.stroke();
    }
    context.restore();
}

/** @param {any} options */
export function createScienceConsole(options) {
    const {
        document = globalThis.document,
        i18n,
        onComplete = () => false,
        onClose = () => {},
        onPhaseChange = () => {},
        onResultAction = () => {}
    } = options;
    const view = document.defaultView ?? globalThis;
    const elements = {
        root: document.querySelector('#agency-science-console'),
        title: document.querySelector('#agency-science-title'),
        close: document.querySelector('#agency-science-close'),
        screen: document.querySelector('.agency-science-screen'),
        dashboard: document.querySelector('.agency-science-dashboard'),
        canvas: document.querySelector('#agency-science-canvas'),
        coach: document.querySelector('#agency-science-coach'),
        instructions: document.querySelector('#agency-science-instructions'),
        status: document.querySelector('#agency-science-status'),
        progress: document.querySelector('#agency-science-progress'),
        capture: document.querySelector('#agency-science-capture'),
        tuningGroup: document.querySelector('#agency-science-tuning-group'),
        tuning: document.querySelector('#agency-science-tuning'),
        signal: document.querySelector('#agency-science-signal'),
        result: document.querySelector('#agency-science-result'),
        resultTitle: document.querySelector('#agency-discovery-title'),
        resultExplanation: document.querySelector('#agency-discovery-explanation'),
        resultScore: document.querySelector('#agency-discovery-score'),
        resultActions: [...document.querySelectorAll('[data-science-result-action]')],
        announcer: document.querySelector('#agency-science-announcer')
    };
    const context = elements.canvas.getContext('2d');
    let state = null;
    let mission = null;
    let operationTitle = '';
    let frameId = null;
    let lastFrameTime = null;
    let completionSent = false;
    let deterministic = false;
    let completedReport = null;
    let suppressNextCanvasClick = false;
    const effects = { captureFlash: 0 };
    const art = createPaperArtAtlas(view, () => draw());

    function instructionKey() {
        if (state?.kind === 'near-earth-object') return 'game.agency.science.neo.instructions';
        if (state?.kind === 'planetary-map') return 'game.agency.science.mars.instructions';
        return 'game.agency.science.solar.instructions';
    }

    function captureKey() {
        return state?.kind === 'near-earth-object'
            ? 'game.agency.science.capture.neo'
            : 'game.agency.science.capture.solar';
    }

    function coachText() {
        if (!state) return '';
        const feedbackKey = state.feedback || (state.phase === 'launch' ? 'launch' : 'ready');
        return i18n.t(`game.agency.science.feedback.${feedbackKey}`);
    }

    function statusText() {
        if (!state) return '';
        if (state.completed) return i18n.t('game.agency.science.complete', { score: state.score });
        if (state.phase === 'launch') return i18n.t('game.agency.science.launching');
        if (state.kind === 'planetary-map') return i18n.t('game.agency.science.lock', { value: Math.round(state.lockProgress * 100) });
        return i18n.t('game.agency.science.samples', { count: state.samples, score: state.score });
    }

    function progressValue() {
        if (!state) return 0;
        if (state.completed) return 100;
        if (state.phase === 'launch') return Math.round(state.launchProgress * 100);
        if (state.kind === 'planetary-map') return Math.round(state.lockProgress * 100);
        return Math.round(state.samples / 3 * 100);
    }

    function resizeCanvas() {
        const bounds = elements.canvas.getBoundingClientRect();
        const width = Math.max(320, bounds.width || 960);
        const height = Math.max(180, bounds.height || 520);
        const pixelRatio = Math.min(2, view.devicePixelRatio || 1);
        const nextWidth = Math.round(width * pixelRatio);
        const nextHeight = Math.round(height * pixelRatio);
        if (elements.canvas.width !== nextWidth || elements.canvas.height !== nextHeight) {
            elements.canvas.width = nextWidth;
            elements.canvas.height = nextHeight;
        }
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        return { width, height };
    }

    function draw() {
        if (!state || elements.root.hidden) return;
        const { width, height } = resizeCanvas();
        context.clearRect(0, 0, width, height);
        drawPaperBackdrop(context, width, height, state.seed, art, state.elapsedMs);
        if (state.phase === 'launch') drawLaunch(context, state, width, height, art);
        else if (state.kind === 'solar-weather') drawSolar(context, state, width, height, art);
        else if (state.kind === 'near-earth-object') drawNeo(context, state, width, height, art);
        else drawMars(context, state, width, height, art);
        drawCaptureFlash(context, width, height, effects);
    }

    function render() {
        if (!state) return;
        elements.title.textContent = operationTitle || i18n.t('game.agency.science.title');
        elements.instructions.textContent = i18n.t(instructionKey());
        elements.coach.textContent = coachText();
        elements.coach.dataset.feedback = state.feedback || '';
        elements.status.textContent = statusText();
        elements.progress.value = progressValue();
        elements.progress.setAttribute('aria-label', statusText());
        const isScience = state.phase === 'science';
        elements.capture.hidden = !isScience || state.kind === 'planetary-map';
        elements.capture.disabled = state.completed;
        elements.capture.textContent = i18n.t(captureKey());
        elements.canvas.classList.toggle('is-capture-ready', isScience
            && state.kind === 'near-earth-object'
            && state.focusProgress >= .75);
        elements.tuningGroup.hidden = !(isScience && state.kind === 'planetary-map');
        elements.tuning.value = String(Math.round(state.tuning * 100));
        elements.signal.value = `${Math.round(state.signalStrength * 100)}%`;
        draw();
    }

    function notifyCompletion() {
        if (!state?.completed || completionSent || !mission) return;
        completionSent = true;
        elements.announcer.textContent = statusText();
        const completion = onComplete({ missionId: mission.id, score: state.score });
        completedReport = completion?.report ?? completion;
        if (completedReport) showDiscoveryResult(completedReport);
    }

    function showDiscoveryResult(report) {
        const kindKey = state?.kind ?? 'solar-weather';
        elements.result.dataset.discoveryKind = kindKey;
        elements.resultTitle.textContent = i18n.t(`game.agency.discovery.${kindKey}.title`);
        elements.resultExplanation.textContent = i18n.t(`game.agency.discovery.${kindKey}.copy`);
        elements.resultScore.textContent = `${Math.round(report?.quality ?? state?.score ?? 0)}%`;
        elements.screen.hidden = true;
        elements.dashboard.hidden = true;
        elements.result.hidden = false;
        elements.resultActions.find((button) => button.dataset.scienceResultAction === 'archive')?.focus({ preventScroll: true });
    }

    function step(milliseconds) {
        if (!state || elements.root.hidden) return;
        const previousPhase = state.phase;
        state = advanceScienceSimulation(state, milliseconds);
        if (previousPhase === 'launch' && state.phase === 'science') onPhaseChange('investigate');
        effects.captureFlash = Math.max(0, effects.captureFlash - milliseconds / 520);
        render();
        notifyCompletion();
    }

    function frame(timestamp) {
        if (deterministic || elements.root.hidden) return;
        if (state?.completed || elements.screen.hidden) {
            frameId = null;
            return;
        }
        const delta = lastFrameTime === null ? 16 : Math.min(64, timestamp - lastFrameTime);
        lastFrameTime = timestamp;
        step(delta);
        if (state?.completed || elements.screen.hidden) {
            frameId = null;
            return;
        }
        frameId = view.requestAnimationFrame(frame);
    }

    function startLoop() {
        if (frameId !== null) view.cancelAnimationFrame(frameId);
        deterministic = false;
        lastFrameTime = null;
        frameId = view.requestAnimationFrame(frame);
    }

    function open(nextMission, operation, journey = {}) {
        mission = nextMission;
        operationTitle = operation?.title ?? '';
        state = createScienceSimulation({
            kind: nextMission.kind,
            seed: nextMission.id,
            tutorial: Boolean(journey.tutorial),
            attempt: journey.attempt
        });
        effects.captureFlash = 0;
        completionSent = false;
        completedReport = null;
        suppressNextCanvasClick = false;
        elements.announcer.textContent = '';
        elements.screen.hidden = false;
        elements.dashboard.hidden = false;
        elements.result.hidden = true;
        elements.root.hidden = false;
        render();
        startLoop();
        elements.canvas.focus({ preventScroll: true });
    }

    function close() {
        if (elements.root.hidden) return;
        if (frameId !== null) view.cancelAnimationFrame(frameId);
        frameId = null;
        elements.root.hidden = true;
        onClose(mission?.id ?? null);
    }

    function capture() {
        if (!state) return;
        const previousSamples = state.samples;
        state = applyScienceAction(state, { type: 'capture' });
        if (state.samples > previousSamples) {
            effects.captureFlash = 1;
            elements.announcer.textContent = statusText();
        }
        render();
        notifyCompletion();
    }

    function setAimFromPointer(event) {
        if (!state || state.kind !== 'near-earth-object' || state.phase !== 'science') return;
        const bounds = elements.canvas.getBoundingClientRect();
        state = applyScienceAction(state, {
            type: 'aim',
            x: (event.clientX - bounds.left) / bounds.width,
            y: (event.clientY - bounds.top) / bounds.height
        });
        draw();
        event.preventDefault();
    }

    function handleCanvasClick() {
        if (suppressNextCanvasClick) {
            suppressNextCanvasClick = false;
            return;
        }
        if (state?.kind === 'near-earth-object' && state.phase === 'science') capture();
    }

    function handleCanvasPointerUp(event) {
        if (!['touch', 'pen'].includes(event.pointerType)) return;
        if (state?.kind === 'near-earth-object' && state.phase === 'science' && state.focusProgress >= .75) {
            suppressNextCanvasClick = true;
            capture();
            event.preventDefault();
            view.setTimeout(() => { suppressNextCanvasClick = false; }, 0);
        }
    }

    function handleKeydown(event) {
        if (!state || elements.root.hidden) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            close();
            return;
        }
        if ((event.key === ' ' || event.key === 'Enter') && state.kind !== 'planetary-map') {
            event.preventDefault();
            capture();
            return;
        }
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || state.phase !== 'science') return;
        event.preventDefault();
        if (state.kind === 'near-earth-object') {
            const horizontal = event.key === 'ArrowLeft' ? -.035 : event.key === 'ArrowRight' ? .035 : 0;
            const vertical = event.key === 'ArrowUp' ? -.035 : event.key === 'ArrowDown' ? .035 : 0;
            state = applyScienceAction(state, { type: 'aim', x: state.aim.x + horizontal, y: state.aim.y + vertical });
        } else if (state.kind === 'planetary-map') {
            const direction = event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1;
            state = applyScienceAction(state, { type: 'tune', value: state.tuning + direction * .025 });
        }
        render();
    }

    function handleTuning() {
        if (!state) return;
        state = applyScienceAction(state, { type: 'tune', value: Number(elements.tuning.value) / 100 });
        render();
    }

    function handleResultAction(event) {
        const action = event.currentTarget.dataset.scienceResultAction;
        onResultAction(action, { mission, report: completedReport, score: state?.score ?? 0 });
    }

    elements.close.addEventListener('click', close);
    elements.capture.addEventListener('click', capture);
    elements.tuning.addEventListener('input', handleTuning);
    elements.root.addEventListener('keydown', handleKeydown);
    elements.canvas.addEventListener('pointermove', setAimFromPointer);
    elements.canvas.addEventListener('pointerup', handleCanvasPointerUp);
    elements.canvas.addEventListener('click', handleCanvasClick);
    elements.resultActions.forEach((button) => button.addEventListener('click', handleResultAction));
    const unsubscribe = i18n.subscribe(render);

    return Object.freeze({
        open,
        close,
        advanceTime(milliseconds) {
            deterministic = true;
            if (frameId !== null) view.cancelAnimationFrame(frameId);
            frameId = null;
            step(Math.max(0, Number(milliseconds) || 0));
        },
        getState() {
            if (!state || elements.root.hidden) return null;
            return {
                mode: 'agency-science', kind: state.kind, phase: state.phase,
                samples: state.samples, score: state.score, launchProgress: state.launchProgress,
                scan: state.scan,
                aim: state.aim, tuning: state.tuning, signalStrength: state.signalStrength,
                lockProgress: state.lockProgress, focusProgress: state.focusProgress,
                tutorial: state.tutorial, mistakes: state.mistakes, feedback: state.feedback,
                target: getScienceTarget(state)
            };
        },
        destroy() {
            close();
            elements.close.removeEventListener('click', close);
            elements.capture.removeEventListener('click', capture);
            elements.tuning.removeEventListener('input', handleTuning);
            elements.root.removeEventListener('keydown', handleKeydown);
            elements.canvas.removeEventListener('pointermove', setAimFromPointer);
            elements.canvas.removeEventListener('pointerup', handleCanvasPointerUp);
            elements.canvas.removeEventListener('click', handleCanvasClick);
            elements.resultActions.forEach((button) => button.removeEventListener('click', handleResultAction));
            unsubscribe();
        }
    });
}
