import { createDockingState, getDockingTelemetry, stepDocking } from './dockingSimulation.js';

const DOCKING_ACTIONS = Object.freeze([
    'forward', 'reverse', 'up', 'down', 'rotate-left', 'rotate-right', 'stabilize'
]);

export function createDockingInputState() {
    return Object.fromEntries(DOCKING_ACTIONS.map((action) => [action, false]));
}

export function setDockingAction(state, action, active) {
    if (!Object.prototype.hasOwnProperty.call(state, action)) return false;
    state[action] = Boolean(active);
    return true;
}

export function readDockingInput(state) {
    return {
        horizontal: Number(Boolean(state.forward)) - Number(Boolean(state.reverse)),
        vertical: Number(Boolean(state.up)) - Number(Boolean(state.down)),
        rotation: Number(Boolean(state['rotate-right'])) - Number(Boolean(state['rotate-left'])),
        stabilize: Boolean(state.stabilize)
    };
}

function drawBackdrop(scene) {
    const background = scene.add.graphics();
    background.fillStyle(0x13294a, 1);
    background.fillRect(0, 0, 960, 540);
    for (let index = 0; index < 58; index += 1) {
        const x = (index * 157 + 43) % 960;
        const y = (index * 83 + 29) % 450;
        const radius = index % 7 === 0 ? 2.2 : 1.15;
        background.fillStyle(index % 5 === 0 ? 0xf4c85f : 0xf4e9c7, 0.42 + (index % 3) * 0.18);
        background.fillCircle(x, y, radius);
    }

    const earth = scene.add.graphics();
    earth.fillStyle(0x0d172d, 0.35);
    earth.fillCircle(74, 570, 224);
    earth.fillStyle(0x4f8298, 1);
    earth.fillCircle(64, 558, 218);
    earth.fillStyle(0x7cae8d, 1);
    earth.fillEllipse(100, 425, 130, 55);
    earth.fillEllipse(20, 470, 80, 42);
    earth.lineStyle(7, 0x282633, 1);
    earth.strokeCircle(64, 558, 218);

    const orbit = scene.add.graphics();
    orbit.lineStyle(2, 0xf3e6bd, 0.18);
    orbit.strokeEllipse(420, 520, 820, 270);
}

function drawApproachCorridor(scene) {
    const corridor = scene.add.graphics();
    corridor.fillStyle(0xf4c85f, 0.08);
    corridor.fillRect(600, 238, 248, 64);
    corridor.lineStyle(3, 0xf4c85f, 0.7);
    for (let x = 600; x < 842; x += 28) {
        corridor.lineBetween(x, 238, Math.min(x + 16, 842), 238);
        corridor.lineBetween(x, 302, Math.min(x + 16, 842), 302);
    }
    corridor.lineStyle(1, 0xf4c85f, 0.3);
    corridor.lineBetween(600, 270, 848, 270);
    return corridor;
}

function createIss(scene) {
    const station = scene.add.container(858, 270);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x071021, 0.45);
    shadow.fillRoundedRect(-62, -31, 122, 62, 7);
    shadow.x = 7;
    shadow.y = 8;

    const paper = scene.add.graphics();
    paper.fillStyle(0xe9dfbf, 1);
    paper.fillRoundedRect(-58, -28, 116, 56, 6);
    paper.fillStyle(0xbec8c3, 1);
    paper.fillRect(-78, -9, 156, 18);
    paper.fillStyle(0x3e7184, 1);
    paper.fillRect(-128, -36, 48, 72);
    paper.fillRect(80, -36, 48, 72);
    paper.lineStyle(3, 0x292733, 1);
    paper.strokeRect(-128, -36, 48, 72);
    paper.strokeRect(80, -36, 48, 72);
    paper.strokeRoundedRect(-58, -28, 116, 56, 6);
    for (const panelX of [-116, -104, -92, 92, 104, 116]) paper.lineBetween(panelX, -34, panelX, 34);

    const port = scene.add.graphics();
    port.fillStyle(0x282733, 1);
    port.fillCircle(-70, 0, 16);
    port.fillStyle(0xf4c85f, 1);
    port.fillCircle(-70, 0, 9);
    station.add([shadow, paper, port]);
    station.rotation = -0.012;
    return station;
}

function createCourier(scene) {
    const ship = scene.add.container(0, 0);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x071021, 0.45);
    shadow.fillTriangle(-26, -19, -26, 19, 33, 0);
    shadow.x = 5;
    shadow.y = 6;

    const hull = scene.add.graphics();
    hull.fillStyle(0xf0e2ba, 1);
    hull.fillTriangle(-28, -18, -28, 18, 34, 0);
    hull.fillStyle(0xd5634d, 1);
    hull.fillTriangle(-18, -12, -38, -30, 5, -12);
    hull.fillTriangle(-18, 12, -38, 30, 5, 12);
    hull.lineStyle(3, 0x292733, 1);
    hull.strokeTriangle(-28, -18, -28, 18, 34, 0);
    hull.strokeTriangle(-18, -12, -38, -30, 5, -12);
    hull.strokeTriangle(-18, 12, -38, 30, 5, 12);
    hull.fillStyle(0x4f8298, 1);
    hull.fillCircle(7, 0, 7);
    hull.lineStyle(2, 0x292733, 1);
    hull.strokeCircle(7, 0, 7);

    const exhaust = scene.add.graphics();
    exhaust.fillStyle(0xf4c85f, 0.9);
    exhaust.fillTriangle(-30, -7, -52, 0, -30, 7);
    exhaust.setVisible(false);
    ship.add([shadow, exhaust, hull]);
    ship.exhaust = exhaust;
    return ship;
}

function mapShipPosition(state) {
    return {
        x: 110 + ((state.position.x + 9) / 9) * 670,
        y: 270 - state.position.y * 45
    };
}

function keyDown(key) {
    return Boolean(key?.isDown);
}

/**
 * @param {{
 *   parent: HTMLElement,
 *   onReady?: () => void,
 *   onTelemetry?: (telemetry: ReturnType<typeof getDockingTelemetry>) => void,
 *   onEvent?: (event: string) => void
 * }} options
 */
export async function createDockingGame({
    parent,
    onReady = () => {},
    onTelemetry = () => {},
    onEvent = () => {}
}) {
    const phaserModule = await import('phaser');
    const Phaser = /** @type {any} */ (phaserModule.default ?? phaserModule);
    const actions = createDockingInputState();
    let resolveReady;
    const ready = new Promise((resolve) => { resolveReady = resolve; });

    class DockingScene extends Phaser.Scene {
        constructor() {
            super('iss-docking');
            this.simulation = createDockingState();
            this.telemetryElapsed = 0;
            this.dockedEmitted = false;
        }

        create() {
            drawBackdrop(this);
            this.corridor = drawApproachCorridor(this);
            this.station = createIss(this);
            this.ship = createCourier(this);
            this.keys = this.input.keyboard?.addKeys({
                forward: 'W', reverse: 'S', up: 'UP', down: 'DOWN',
                forwardArrow: 'RIGHT', reverseArrow: 'LEFT',
                rotateLeft: 'Q', rotateRight: 'E', stabilize: 'SPACE'
            }) ?? {};
            const start = mapShipPosition(this.simulation);
            this.ship.setPosition(start.x, start.y);
            this.ship.setRotation(this.simulation.angle);
            onTelemetry(getDockingTelemetry(this.simulation));
            onReady();
            resolveReady();
        }

        update(_time, deltaMilliseconds) {
            const pointerInput = readDockingInput(actions);
            const input = {
                horizontal: Math.max(-1, Math.min(1, pointerInput.horizontal
                    + Number(keyDown(this.keys.forward) || keyDown(this.keys.forwardArrow))
                    - Number(keyDown(this.keys.reverse) || keyDown(this.keys.reverseArrow)))),
                vertical: Math.max(-1, Math.min(1, pointerInput.vertical
                    + Number(keyDown(this.keys.up)) - Number(keyDown(this.keys.down)))),
                rotation: Math.max(-1, Math.min(1, pointerInput.rotation
                    + Number(keyDown(this.keys.rotateRight)) - Number(keyDown(this.keys.rotateLeft)))),
                stabilize: pointerInput.stabilize || keyDown(this.keys.stabilize)
            };
            this.simulation = stepDocking(this.simulation, input, deltaMilliseconds / 1000);
            const position = mapShipPosition(this.simulation);
            this.ship.setPosition(position.x, position.y);
            this.ship.setRotation(this.simulation.angle);
            this.ship.exhaust.setVisible(input.horizontal > 0 && this.simulation.phase !== 'docked');

            this.telemetryElapsed += deltaMilliseconds;
            if (this.telemetryElapsed >= 80 || this.simulation.event) {
                this.telemetryElapsed = 0;
                onTelemetry(getDockingTelemetry(this.simulation));
            }
            if (this.simulation.event === 'unsafe-contact') {
                onEvent('unsafe-contact');
                const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                if (!reducedMotion) this.cameras.main.shake(140, 0.006);
            }
            if (this.simulation.event === 'docked' && !this.dockedEmitted) {
                this.dockedEmitted = true;
                this.tweens.add({ targets: this.corridor, alpha: 0.25, duration: 260 });
                onEvent('docked');
            }
        }
    }

    const game = new Phaser.Game({
        type: Phaser.CANVAS,
        parent,
        width: 960,
        height: 540,
        backgroundColor: '#13294a',
        transparent: false,
        antialias: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 960,
            height: 540
        },
        scene: [DockingScene],
        banner: false
    });
    await ready;

    const resizeObserver = typeof globalThis.ResizeObserver === 'function'
        ? new globalThis.ResizeObserver(() => game.scale.refresh())
        : { observe() {}, disconnect() {} };
    resizeObserver.observe(parent);

    return Object.freeze({
        setAction: (action, active) => setDockingAction(actions, action, active),
        destroy() {
            resizeObserver.disconnect();
            game.destroy(true);
        }
    });
}
