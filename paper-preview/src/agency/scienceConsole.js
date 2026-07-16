import {
    advanceScienceSimulation,
    applyScienceAction,
    createScienceSimulation,
    getScienceTarget
} from './scienceSimulation.js';

function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.roundRect(x, y, width, height, r);
}

function drawPaperStars(context, width, height, seed) {
    context.fillStyle = '#fff5ce';
    for (let index = 0; index < 46; index += 1) {
        const x = ((index * 83 + seed % 97) % 997) / 997 * width;
        const y = ((index * 47 + seed % 61) % 521) / 521 * height;
        const size = index % 9 === 0 ? 2.4 : 1.2;
        context.globalAlpha = .28 + (index % 5) * .12;
        context.fillRect(x, y, size, size);
    }
    context.globalAlpha = 1;
}

function drawProbe(context, x, y, angle = 0, flame = false) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.fillStyle = '#ead8a8';
    context.strokeStyle = '#101936';
    context.lineWidth = 3;
    roundedRect(context, -22, -12, 44, 24, 5);
    context.fill();
    context.stroke();
    context.fillStyle = '#4388b8';
    context.fillRect(-48, -10, 22, 20);
    context.fillRect(26, -10, 22, 20);
    context.strokeRect(-48, -10, 22, 20);
    context.strokeRect(26, -10, 22, 20);
    context.fillStyle = '#f5b83d';
    context.beginPath();
    context.arc(0, 0, 5, 0, Math.PI * 2);
    context.fill();
    if (flame) {
        context.fillStyle = '#d85d4a';
        context.beginPath();
        context.moveTo(-24, -7);
        context.lineTo(-42, 0);
        context.lineTo(-24, 7);
        context.fill();
    }
    context.restore();
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

export function drawLaunch(context, state, width, height) {
    context.strokeStyle = '#f5b83d';
    context.lineWidth = 3;
    context.setLineDash([7, 10]);
    context.beginPath();
    for (let index = 0; index <= 40; index += 1) {
        const point = trajectoryPoint(index / 40, width, height);
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
    }
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = '#4388b8';
    context.beginPath();
    context.arc(width * .08, height * .84, height * .16, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#fff5ce';
    context.lineWidth = 4;
    context.stroke();
    const point = trajectoryPoint(state.launchProgress, width, height);
    const next = trajectoryPoint(Math.min(1, state.launchProgress + .01), width, height);
    drawProbe(context, point.x, point.y, Math.atan2(next.y - point.y, next.x - point.x), true);
}

export function drawSolar(context, state, width, height) {
    const target = getScienceTarget(state).scan;
    const targetX = width * (.12 + target * .78);
    const scanX = width * (.12 + state.scan * .78);
    const gradient = context.createRadialGradient(width * .12, height * .5, 8, width * .12, height * .5, height * .28);
    gradient.addColorStop(0, '#fff4b0');
    gradient.addColorStop(.45, '#f5b83d');
    gradient.addColorStop(1, 'rgb(216 93 74 / 0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(width * .12, height * .5, height * .28, 0, Math.PI * 2);
    context.fill();
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
    context.strokeStyle = '#fff5ce';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(scanX, height * .1);
    context.lineTo(scanX, height * .9);
    context.stroke();
    drawProbe(context, width * .87, height * .2, -.18);
}

export function drawNeo(context, state, width, height) {
    const target = getScienceTarget(state);
    const asteroid = { x: target.x * width, y: target.y * height };
    context.strokeStyle = 'rgb(245 184 61 / .55)';
    context.lineWidth = 2;
    context.setLineDash([5, 9]);
    context.beginPath();
    context.ellipse(width * .5, height * .5, width * .4, height * .28, -.2, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = '#4388b8';
    context.beginPath();
    context.arc(width * .83, height * .68, height * .13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#b59468';
    context.strokeStyle = '#5b4633';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(asteroid.x - 22, asteroid.y - 10);
    context.lineTo(asteroid.x - 6, asteroid.y - 25);
    context.lineTo(asteroid.x + 23, asteroid.y - 12);
    context.lineTo(asteroid.x + 18, asteroid.y + 18);
    context.lineTo(asteroid.x - 12, asteroid.y + 23);
    context.closePath();
    context.fill();
    context.stroke();
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
}

export function drawMars(context, state, width, height) {
    context.fillStyle = '#d85d4a';
    context.strokeStyle = '#7a382f';
    context.lineWidth = 6;
    context.beginPath();
    context.arc(width * .78, height * .52, height * .22, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = 'rgb(92 48 42 / .28)';
    context.beginPath();
    context.arc(width * .72, height * .45, height * .05, 0, Math.PI * 2);
    context.arc(width * .84, height * .61, height * .035, 0, Math.PI * 2);
    context.fill();
    drawProbe(context, width * .2, height * .5, 0);
    context.strokeStyle = `rgb(159 213 231 / ${.2 + state.signalStrength * .8})`;
    context.lineWidth = 4;
    for (let radius = 1; radius <= 4; radius += 1) {
        context.beginPath();
        context.arc(width * .25, height * .5, radius * width * .095, -.65, .65);
        context.stroke();
    }
    context.strokeStyle = '#f5b83d';
    context.lineWidth = 10;
    context.beginPath();
    context.arc(width * .5, height * .86, width * .12, Math.PI, Math.PI + Math.PI * state.lockProgress);
    context.stroke();
}

/** @param {any} options */
export function createScienceConsole(options) {
    const { document = globalThis.document, i18n, onComplete = () => false, onClose = () => {} } = options;
    const view = document.defaultView ?? globalThis;
    const elements = {
        root: document.querySelector('#agency-science-console'),
        title: document.querySelector('#agency-science-title'),
        close: document.querySelector('#agency-science-close'),
        canvas: document.querySelector('#agency-science-canvas'),
        instructions: document.querySelector('#agency-science-instructions'),
        status: document.querySelector('#agency-science-status'),
        progress: document.querySelector('#agency-science-progress'),
        capture: document.querySelector('#agency-science-capture'),
        tuningGroup: document.querySelector('#agency-science-tuning-group'),
        tuning: document.querySelector('#agency-science-tuning'),
        signal: document.querySelector('#agency-science-signal'),
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

    function instructionKey() {
        if (state?.kind === 'near-earth-object') return 'game.agency.science.neo.instructions';
        if (state?.kind === 'planetary-map') return 'game.agency.science.mars.instructions';
        return 'game.agency.science.solar.instructions';
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
        context.fillStyle = '#101936';
        context.fillRect(0, 0, width, height);
        drawPaperStars(context, width, height, state.seed);
        if (state.phase === 'launch') drawLaunch(context, state, width, height);
        else if (state.kind === 'solar-weather') drawSolar(context, state, width, height);
        else if (state.kind === 'near-earth-object') drawNeo(context, state, width, height);
        else drawMars(context, state, width, height);
    }

    function render() {
        if (!state) return;
        elements.title.textContent = operationTitle || i18n.t('game.agency.science.title');
        elements.instructions.textContent = i18n.t(instructionKey());
        elements.status.textContent = statusText();
        elements.progress.value = progressValue();
        elements.progress.setAttribute('aria-label', statusText());
        const isScience = state.phase === 'science';
        elements.capture.hidden = !isScience || state.kind === 'planetary-map';
        elements.capture.disabled = state.completed;
        elements.capture.textContent = i18n.t('game.agency.science.capture');
        elements.tuningGroup.hidden = !(isScience && state.kind === 'planetary-map');
        elements.tuning.value = String(Math.round(state.tuning * 100));
        elements.signal.value = `${Math.round(state.signalStrength * 100)}%`;
        draw();
    }

    function notifyCompletion() {
        if (!state?.completed || completionSent || !mission) return;
        completionSent = true;
        elements.announcer.textContent = statusText();
        onComplete({ missionId: mission.id, score: state.score });
    }

    function step(milliseconds) {
        if (!state || elements.root.hidden) return;
        state = advanceScienceSimulation(state, milliseconds);
        render();
        notifyCompletion();
    }

    function frame(timestamp) {
        if (deterministic || elements.root.hidden) return;
        const delta = lastFrameTime === null ? 16 : Math.min(64, timestamp - lastFrameTime);
        lastFrameTime = timestamp;
        step(delta);
        frameId = view.requestAnimationFrame(frame);
    }

    function startLoop() {
        if (frameId !== null) view.cancelAnimationFrame(frameId);
        deterministic = false;
        lastFrameTime = null;
        frameId = view.requestAnimationFrame(frame);
    }

    function open(nextMission, operation) {
        mission = nextMission;
        operationTitle = operation?.title ?? '';
        state = createScienceSimulation({ kind: nextMission.kind, seed: nextMission.id });
        completionSent = false;
        elements.announcer.textContent = '';
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
        if (state.samples > previousSamples) elements.announcer.textContent = statusText();
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

    elements.close.addEventListener('click', close);
    elements.capture.addEventListener('click', capture);
    elements.tuning.addEventListener('input', handleTuning);
    elements.root.addEventListener('keydown', handleKeydown);
    elements.canvas.addEventListener('pointermove', setAimFromPointer);
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
                lockProgress: state.lockProgress, target: getScienceTarget(state)
            };
        },
        destroy() {
            close();
            elements.close.removeEventListener('click', close);
            elements.capture.removeEventListener('click', capture);
            elements.tuning.removeEventListener('input', handleTuning);
            elements.root.removeEventListener('keydown', handleKeydown);
            elements.canvas.removeEventListener('pointermove', setAimFromPointer);
            unsubscribe();
        }
    });
}
