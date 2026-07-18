import {
    ICE_RADAR_PASS_POSITIONS,
    createIceRadarState,
    getIceRadarTelemetry,
    stepIceRadar
} from './iceRadarSimulation.js';

const ACTIONS = Object.freeze(['forward', 'reverse', 'up', 'down', 'stabilize']);

export function createIceRadarLayout(width = 960, height = 540) {
    const portrait = height > width * 1.08;
    return Object.freeze({
        orientation: portrait ? 'portrait' : 'landscape',
        width: portrait ? 540 : 960,
        height: portrait ? 960 : 540,
        field: Object.freeze(portrait
            ? { x: 44, y: 170, width: 452, height: 335 }
            : { x: 48, y: 92, width: 560, height: 390 }),
        console: Object.freeze(portrait
            ? { x: 44, y: 525, width: 452, height: 245 }
            : { x: 632, y: 92, width: 280, height: 390 })
    });
}

export function createIceRadarInputState() {
    return Object.fromEntries(ACTIONS.map((action) => [action, false]));
}

export function setIceRadarAction(state, action, active) {
    if (!Object.prototype.hasOwnProperty.call(state, action)) return false;
    state[action] = Boolean(active);
    return true;
}

export function readIceRadarInput(state) {
    return {
        horizontal: Number(Boolean(state.forward)) - Number(Boolean(state.reverse)),
        vertical: Number(Boolean(state.up)) - Number(Boolean(state.down)),
        scan: Boolean(state.stabilize)
    };
}

function keyDown(key) { return Boolean(key?.isDown); }

export function readIceRadarKeyboardInput(keys = {}) {
    return {
        horizontal: Number(keyDown(keys.d) || keyDown(keys.arrowRight))
            - Number(keyDown(keys.a) || keyDown(keys.arrowLeft)),
        vertical: Number(keyDown(keys.w) || keyDown(keys.arrowUp))
            - Number(keyDown(keys.s) || keyDown(keys.arrowDown)),
        scan: keyDown(keys.scan)
    };
}

export function mapIceRadarPosition(position, layout = createIceRadarLayout()) {
    const field = layout.field;
    const normalized = (Math.max(-1, Math.min(1, position)) + 1) / 2;
    return Object.freeze({
        x: field.x + 34 + normalized * (field.width - 68),
        y: field.y + 42
    });
}

function drawBackdrop(scene, layout) {
    const sky = scene.add.graphics();
    sky.fillStyle(0x081229, 1).fillRect(0, 0, layout.width, layout.height);
    for (let i = 0; i < 70; i += 1) {
        sky.fillStyle(i % 7 ? 0xfff3cf : 0x9fd5e7, 0.2 + (i % 4) * 0.13);
        sky.fillCircle((i * 157 + 21) % layout.width, (i * 73 + 11) % layout.height, i % 13 ? 1 : 2);
    }
}

function drawIceField(scene, layout) {
    const f = layout.field;
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x020714, 0.5).fillRoundedRect(f.x + 8, f.y + 10, f.width, f.height, 18);
    const ice = scene.add.graphics();
    ice.fillStyle(0xeef7f2, 1).fillRoundedRect(f.x, f.y, f.width, f.height, 18);
    ice.fillStyle(0xc3e2df, 1).fillRect(f.x + 5, f.y + 80, f.width - 10, f.height * 0.49);
    ice.fillStyle(0x356f7a, 1).fillRect(f.x + 5, f.y + f.height * 0.68, f.width - 10, f.height * 0.29);
    ice.fillStyle(0x143f59, 1).fillRect(f.x + 5, f.y + f.height * 0.81, f.width - 10, f.height * 0.16);
    ice.lineStyle(6, 0x273143, 1).strokeRoundedRect(f.x, f.y, f.width, f.height, 18);
    ice.lineStyle(3, 0x739ba1, 0.8);
    for (let i = 0; i < 8; i += 1) {
        const x = f.x + 25 + ((i * 67) % Math.max(40, f.width - 50));
        ice.beginPath().moveTo(x, f.y + 88).lineTo(x + 14, f.y + 120).lineTo(x - 7, f.y + 165).strokePath();
    }
    for (const pass of ICE_RADAR_PASS_POSITIONS) {
        const p = mapIceRadarPosition(pass, layout);
        ice.lineStyle(2, 0xd5634d, 0.35).lineBetween(p.x, f.y + 62, p.x, f.y + f.height - 18);
    }
    return ice;
}

function createHeading(scene, layout, language) {
    const pt = language !== 'en';
    const y = layout.orientation === 'portrait' ? 118 : 24;
    scene.add.text(layout.width / 2, y, pt ? 'PISTA 2 · VÊ SOB O GELO' : 'CLUE 2 · SEE BELOW THE ICE', {
        fontFamily: 'Arial', fontSize: layout.orientation === 'portrait' ? '17px' : '15px',
        fontStyle: 'bold', color: '#f4c85f', letterSpacing: 2
    }).setOrigin(0.5, 0);
    return scene.add.text(layout.width / 2, y + 26,
        pt ? 'Move o radar, ajusta a potência e segura ANALISAR.' : 'Move the radar, set power and hold SCAN.', {
            fontFamily: 'Arial', fontSize: layout.orientation === 'portrait' ? '21px' : '19px',
            fontStyle: 'bold', color: '#fff3cf', align: 'center', wordWrap: { width: layout.width - 70 }
        }).setOrigin(0.5, 0);
}

function createCart(scene) {
    const cart = scene.add.container();
    const shadow = scene.add.graphics({ x: 4, y: 5 });
    shadow.fillStyle(0x05091a, 0.45).fillRoundedRect(-28, -13, 56, 28, 7);
    const body = scene.add.graphics();
    body.fillStyle(0xd5634d, 1).fillRoundedRect(-28, -13, 56, 28, 7);
    body.fillStyle(0xfff0c4, 1).fillTriangle(-12, -13, 0, -35, 12, -13);
    body.lineStyle(4, 0x273143, 1).strokeRoundedRect(-28, -13, 56, 28, 7);
    body.fillStyle(0x273143, 1).fillCircle(-17, 17, 7).fillCircle(17, 17, 7);
    cart.add([shadow, body]);
    return cart;
}

function drawRadar(graphics, simulation, layout) {
    graphics.clear();
    const f = layout.field;
    const p = mapIceRadarPosition(simulation.position, layout);
    if (simulation.scanning) {
        const alpha = 0.18 + simulation.power * 0.28;
        graphics.fillStyle(0xf4c85f, alpha).fillTriangle(p.x - 5, p.y + 14, p.x - 72, f.y + f.height - 18, p.x + 72, f.y + f.height - 18);
        graphics.lineStyle(3, 0xf4c85f, 0.8).lineBetween(p.x, p.y + 12, p.x, f.y + f.height - 20);
    }
    simulation.passProgress.forEach((progress, index) => {
        const target = mapIceRadarPosition(ICE_RADAR_PASS_POSITIONS[index], layout);
        const oceanY = f.y + f.height * 0.8;
        graphics.lineStyle(7, 0x8fd5da, 0.15 + progress * 0.85);
        graphics.lineBetween(target.x - 31, oceanY, target.x + 31, oceanY);
        graphics.fillStyle(progress >= 1 ? 0xf4c85f : 0x315d62, 1).fillCircle(target.x, f.y + f.height - 19, 7 + progress * 5);
    });
}

function drawConsole(scene, layout) {
    const c = layout.console;
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x020714, 0.5).fillRoundedRect(c.x + 7, c.y + 8, c.width, c.height, 16);
    const paper = scene.add.graphics();
    paper.fillStyle(0xfff0c4, 1).fillRoundedRect(c.x, c.y, c.width, c.height, 16);
    paper.lineStyle(5, 0x9d7942, 1).strokeRoundedRect(c.x, c.y, c.width, c.height, 16);
    paper.fillStyle(0x4d8490, 1).fillRect(c.x + 18, c.y - 7, Math.min(94, c.width * 0.34), 15);
}

function createConsoleLabels(scene, layout, language) {
    const pt = language !== 'en';
    const c = layout.console;
    const title = scene.add.text(c.x + 22, c.y + 24, pt ? 'MAPA DO ECO' : 'ECHO MAP', {
        fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#293043'
    });
    const status = scene.add.text(c.x + 22, c.y + 58, '', {
        fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#315d62',
        wordWrap: { width: c.width - 44 }
    });
    return { title, status };
}

function drawMeters(graphics, simulation, layout, language) {
    graphics.clear();
    const pt = language !== 'en';
    const c = layout.console;
    const telemetry = getIceRadarTelemetry(simulation);
    const rows = [
        [pt ? 'MAPA' : 'MAP', telemetry.coverage, 0x4d8490],
        [pt ? 'POTÊNCIA' : 'POWER', simulation.power, 0xf4c85f],
        [pt ? 'CALOR' : 'HEAT', simulation.heat, simulation.heat > 0.8 ? 0xd5634d : 0x5a9a74]
    ];
    const startY = c.y + 108;
    rows.forEach(([label, value, color], index) => {
        const y = startY + index * 53;
        graphics.fillStyle(0xe2d3a9, 1).fillRoundedRect(c.x + 22, y + 20, c.width - 44, 17, 8);
        graphics.fillStyle(color, 1).fillRoundedRect(c.x + 22, y + 20, (c.width - 44) * value, 17, 8);
        sceneText(graphics.scene, c.x + 22, y, `${label}  ${Math.round(value * 100)}%`);
    });
}

function sceneText(scene, x, y, text) {
    // Meters are redrawn often; reuse one small label per coordinate.
    const key = `radar-${x}-${y}`;
    scene.__radarLabels ??= {};
    if (!scene.__radarLabels[key]) {
        scene.__radarLabels[key] = scene.add.text(x, y, text, {
            fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#293043'
        });
    } else scene.__radarLabels[key].setText(text);
}

function statusText(simulation, language) {
    const pt = language !== 'en';
    if (simulation.phase === 'complete') return pt ? 'Oceano escondido encontrado!' : 'Hidden ocean found!';
    if (simulation.overheated) return pt ? 'Radar quente! Solta ANALISAR para arrefecer.' : 'Radar hot! Release SCAN to cool.';
    const next = simulation.passProgress.findIndex((value) => value < 1);
    return pt ? `Faixa ${Math.max(1, next + 1)} de 3 · procura o eco azul.` : `Pass ${Math.max(1, next + 1)} of 3 · find the blue echo.`;
}

/** @param {{parent: HTMLElement, language?: string, profile?: object, onReady?: Function, onTelemetry?: Function, onEvent?: Function}} options */
export async function createIceRadarGame({
    parent, language = 'pt', profile = {}, onReady = () => {}, onTelemetry = () => {}, onEvent = () => {}
}) {
    const phaserModule = await import('phaser');
    const Phaser = phaserModule.default ?? phaserModule;
    const actions = createIceRadarInputState();
    let layout = createIceRadarLayout(parent.clientWidth || 960, parent.clientHeight || 540);
    let resolveReady;
    const ready = new Promise((resolve) => { resolveReady = resolve; });
    const sceneKey = profile.id ?? 'europa-radar';

    class RadarScene extends Phaser.Scene {
        constructor() {
            super(sceneKey);
            this.simulation = createIceRadarState(profile.initialState);
            this.telemetryElapsed = 0;
            this.emittedEvent = null;
        }
        init(data = {}) { if (data.simulation) this.simulation = createIceRadarState(data.simulation); }
        create() {
            drawBackdrop(this, layout);
            drawIceField(this, layout);
            this.heading = createHeading(this, layout, language);
            drawConsole(this, layout);
            this.labels = createConsoleLabels(this, layout, language);
            this.radarGraphics = this.add.graphics();
            this.meters = this.add.graphics();
            this.cart = createCart(this);
            this.keys = this.input.keyboard?.addKeys({
                w: 'W', a: 'A', s: 'S', d: 'D', arrowUp: 'UP', arrowDown: 'DOWN',
                arrowLeft: 'LEFT', arrowRight: 'RIGHT', scan: 'SPACE'
            }) ?? {};
            onTelemetry(getIceRadarTelemetry(this.simulation));
            onReady(); resolveReady();
        }
        update(_time, deltaMilliseconds) {
            const touch = readIceRadarInput(actions);
            const keyboard = readIceRadarKeyboardInput(this.keys);
            this.simulation = stepIceRadar(this.simulation, {
                horizontal: Math.max(-1, Math.min(1, touch.horizontal + keyboard.horizontal)),
                vertical: Math.max(-1, Math.min(1, touch.vertical + keyboard.vertical)),
                scan: touch.scan || keyboard.scan
            }, deltaMilliseconds / 1000);
            const position = mapIceRadarPosition(this.simulation.position, layout);
            this.cart.setPosition(position.x, position.y);
            drawRadar(this.radarGraphics, this.simulation, layout);
            drawMeters(this.meters, this.simulation, layout, language);
            this.labels.status.setText(statusText(this.simulation, language));
            this.telemetryElapsed += deltaMilliseconds;
            if (this.telemetryElapsed >= 90 || this.simulation.event) {
                this.telemetryElapsed = 0;
                onTelemetry(getIceRadarTelemetry(this.simulation));
            }
            if (this.simulation.event && this.simulation.event !== this.emittedEvent) {
                this.emittedEvent = this.simulation.event;
                onEvent(this.simulation.event);
            }
            if (!this.simulation.event) this.emittedEvent = null;
        }
    }
    const game = new Phaser.Game({
        type: Phaser.CANVAS, parent, width: layout.width, height: layout.height,
        backgroundColor: '#081229', antialias: true,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: layout.width, height: layout.height },
        scene: [RadarScene], banner: false
    });
    await ready;
    const observer = typeof globalThis.ResizeObserver === 'function' ? new globalThis.ResizeObserver(() => {
        const next = createIceRadarLayout(parent.clientWidth || 960, parent.clientHeight || 540);
        if (next.orientation === layout.orientation) { game.scale.refresh(); return; }
        const scene = game.scene.getScene(sceneKey);
        const simulation = scene?.simulation;
        layout = next; game.scale.resize(layout.width, layout.height); scene?.scene.restart({ simulation });
    }) : { observe() {}, disconnect() {} };
    observer.observe(parent);
    return Object.freeze({
        setAction: (action, active) => setIceRadarAction(actions, action, active),
        getState: () => {
            const state = game.scene.getScene(sceneKey)?.simulation;
            return state ? structuredClone(state) : null;
        },
        advanceTime(milliseconds) {
            const scene = game.scene.getScene(sceneKey);
            const frame = 1000 / 60;
            for (let i = 0; scene?.simulation && i < Math.max(1, Math.round(milliseconds / frame)); i += 1) scene.update(i * frame, frame);
        },
        destroy() { observer.disconnect(); game.destroy(true); }
    });
}
