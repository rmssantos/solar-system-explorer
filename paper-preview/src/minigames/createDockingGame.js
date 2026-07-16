import {
    DOCKING_LIMITS,
    createDockingState,
    getDockingTelemetry,
    stepDocking
} from './dockingSimulation.js';
import { getOrbitalMissionProfile } from './orbitalMissionProfiles.js';

const DOCKING_ACTIONS = Object.freeze([
    'forward', 'reverse', 'up', 'down', 'rotate-left', 'rotate-right', 'stabilize'
]);

export const DOCKING_LAYOUT = Object.freeze({
    orientation: 'landscape',
    width: 960,
    height: 540,
    edgeMargin: 8,
    issX: 824,
    issHalfWidth: 128,
    portOffsetX: -70,
    shipNoseOffset: 34,
    shipStartX: 110,
    simulationMinX: DOCKING_LIMITS.minX,
    simulationContactX: DOCKING_LIMITS.contactX
});

export function createDockingLayout(width = 960, height = 540) {
    if (height > width * 1.08) {
        return Object.freeze({
            orientation: 'portrait',
            width: 540,
            height: 960,
            edgeMargin: 8,
            targetX: 270,
            targetY: 320,
            portY: 397,
            shipNoseOffset: 34,
            shipStartY: 610,
            simulationMinX: DOCKING_LIMITS.minX,
            simulationContactX: DOCKING_LIMITS.contactX
        });
    }
    if (height <= 560 && width <= 1100) {
        return Object.freeze({ ...DOCKING_LAYOUT, compact: true, issX: 500, shipStartX: 70 });
    }
    return DOCKING_LAYOUT;
}

export function createDockingInputState() {
    return Object.fromEntries(DOCKING_ACTIONS.map((action) => [action, false]));
}

export function setDockingAction(state, action, active) {
    if (!Object.prototype.hasOwnProperty.call(state, action)) return false;
    state[action] = Boolean(active);
    return true;
}

export function readDockingInput(state, orientation = 'landscape') {
    const longitudinal = Number(Boolean(state.forward)) - Number(Boolean(state.reverse));
    const lateral = Number(Boolean(state.up)) - Number(Boolean(state.down));
    return {
        horizontal: orientation === 'portrait' ? lateral : longitudinal,
        vertical: orientation === 'portrait' ? longitudinal : lateral,
        rotation: Number(Boolean(state['rotate-right'])) - Number(Boolean(state['rotate-left'])),
        stabilize: Boolean(state.stabilize)
    };
}

function drawBackdrop(scene, layout) {
    const background = scene.add.graphics();
    background.fillStyle(0x13294a, 1);
    background.fillRect(0, 0, layout.width, layout.height);
    for (let index = 0; index < 58; index += 1) {
        const x = (index * 157 + 43) % layout.width;
        const y = (index * 83 + 29) % Math.round(layout.height * 0.86);
        const radius = index % 7 === 0 ? 2.2 : 1.15;
        background.fillStyle(index % 5 === 0 ? 0xf4c85f : 0xf4e9c7, 0.42 + (index % 3) * 0.18);
        background.fillCircle(x, y, radius);
    }

    const earth = scene.add.graphics();
    if (layout.orientation === 'portrait') {
        earth.fillStyle(0x0d172d, 0.35);
        earth.fillCircle(layout.width / 2 + 8, layout.height + 50, 230);
        earth.fillStyle(0x4f8298, 1);
        earth.fillCircle(layout.width / 2, layout.height + 42, 224);
        earth.fillStyle(0x7cae8d, 1);
        earth.fillEllipse(layout.width / 2 - 60, layout.height - 105, 150, 58);
        earth.lineStyle(7, 0x282633, 1);
        earth.strokeCircle(layout.width / 2, layout.height + 42, 224);
    } else {
        earth.fillStyle(0x0d172d, 0.35);
        earth.fillCircle(74, 570, 224);
        earth.fillStyle(0x4f8298, 1);
        earth.fillCircle(64, 558, 218);
        earth.fillStyle(0x7cae8d, 1);
        earth.fillEllipse(100, 425, 130, 55);
        earth.fillEllipse(20, 470, 80, 42);
        earth.lineStyle(7, 0x282633, 1);
        earth.strokeCircle(64, 558, 218);
    }

    const orbit = scene.add.graphics();
    orbit.lineStyle(2, 0xf3e6bd, 0.18);
    if (layout.orientation === 'portrait') orbit.strokeEllipse(layout.width / 2, layout.height - 50, 650, 260);
    else orbit.strokeEllipse(420, 520, 820, 270);
}

function drawApproachCorridor(scene, layout) {
    const corridor = scene.add.graphics();
    if (layout.orientation === 'portrait') {
        const endY = layout.shipStartY - 82;
        corridor.fillStyle(0xf4c85f, 0.08);
        corridor.fillRect(layout.targetX - 32, layout.portY, 64, endY - layout.portY);
        corridor.lineStyle(3, 0xf4c85f, 0.7);
        for (let y = layout.portY; y < endY; y += 28) {
            corridor.lineBetween(layout.targetX - 32, y, layout.targetX - 32, Math.min(y + 16, endY));
            corridor.lineBetween(layout.targetX + 32, y, layout.targetX + 32, Math.min(y + 16, endY));
        }
        corridor.lineStyle(1, 0xf4c85f, 0.3);
        corridor.lineBetween(layout.targetX, layout.portY, layout.targetX, endY);
        return corridor;
    }
    const portX = layout.issX + layout.portOffsetX;
    const corridorStartX = Math.max(layout.shipStartX + 170, portX - 220);
    corridor.fillStyle(0xf4c85f, 0.08);
    corridor.fillRect(corridorStartX, 238, portX - corridorStartX, 64);
    corridor.lineStyle(3, 0xf4c85f, 0.7);
    for (let x = corridorStartX; x < portX; x += 28) {
        corridor.lineBetween(x, 238, Math.min(x + 16, portX), 238);
        corridor.lineBetween(x, 302, Math.min(x + 16, portX), 302);
    }
    corridor.lineStyle(1, 0xf4c85f, 0.3);
    corridor.lineBetween(corridorStartX, 270, portX, 270);
    return corridor;
}

function createIss(scene, layout) {
    const station = scene.add.container(
        layout.orientation === 'portrait' ? layout.targetX : layout.issX,
        layout.orientation === 'portrait' ? layout.targetY : 270
    );
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
    station.rotation = layout.orientation === 'portrait' ? -Math.PI / 2 : -0.012;
    return station;
}

function createHubble(scene, layout) {
    const telescope = scene.add.container(
        layout.orientation === 'portrait' ? layout.targetX : layout.issX,
        layout.orientation === 'portrait' ? layout.targetY : 270
    );
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x071021, 0.45);
    shadow.fillRoundedRect(-55, -25, 112, 50, 8);
    shadow.x = 7;
    shadow.y = 8;

    const body = scene.add.graphics();
    body.fillStyle(0xe7dfc7, 1);
    body.fillRoundedRect(-56, -23, 112, 46, 7);
    body.fillStyle(0x7ea0a7, 1);
    body.fillRect(-28, -23, 24, 46);
    body.fillStyle(0x3e7184, 1);
    body.fillRect(-126, -34, 54, 68);
    body.fillRect(72, -34, 54, 68);
    body.lineStyle(3, 0x292733, 1);
    body.strokeRoundedRect(-56, -23, 112, 46, 7);
    body.strokeRect(-126, -34, 54, 68);
    body.strokeRect(72, -34, 54, 68);
    for (const panelX of [-113, -99, -85, 85, 99, 113]) body.lineBetween(panelX, -32, panelX, 32);
    body.fillStyle(0x282733, 1);
    body.fillCircle(-70, 0, 16);
    body.fillStyle(0xd5634d, 1);
    body.fillCircle(-70, 0, 8);
    body.fillStyle(0x292733, 1);
    body.fillTriangle(56, -23, 78, 0, 56, 23);
    telescope.add([shadow, body]);
    telescope.rotation = layout.orientation === 'portrait' ? -Math.PI / 2 : 0.018;
    return telescope;
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

/**
 * @param {{ x: number, y: number }} position
 * @param {ReturnType<typeof createDockingLayout>} [layout]
 */
export function mapDockingPosition(position, layout = DOCKING_LAYOUT) {
    const progress = (position.x - layout.simulationMinX)
        / (layout.simulationContactX - layout.simulationMinX);
    if (layout.orientation === 'portrait') {
        const contactShipY = layout.portY + layout.shipNoseOffset;
        return {
            x: layout.targetX + position.y * 45,
            y: layout.shipStartY - progress * (layout.shipStartY - contactShipY)
        };
    }
    const contactShipX = layout.issX + layout.portOffsetX - layout.shipNoseOffset;
    return {
        x: layout.shipStartX + progress * (contactShipX - layout.shipStartX),
        y: 270 - position.y * 45
    };
}

function keyDown(key) {
    return Boolean(key?.isDown);
}

export function readDockingKeyboardInput(keys = {}, orientation = 'landscape') {
    const horizontalKeys = Number(keyDown(keys.d) || keyDown(keys.arrowRight))
        - Number(keyDown(keys.a) || keyDown(keys.arrowLeft));
    const verticalKeys = Number(keyDown(keys.w) || keyDown(keys.arrowUp))
        - Number(keyDown(keys.s) || keyDown(keys.arrowDown));
    return {
        horizontal: orientation === 'portrait' ? verticalKeys : horizontalKeys,
        vertical: orientation === 'portrait' ? horizontalKeys : verticalKeys,
        rotation: Number(keyDown(keys.rotateRight)) - Number(keyDown(keys.rotateLeft)),
        stabilize: keyDown(keys.stabilize)
    };
}

/**
 * @param {{
 *   parent: HTMLElement,
 *   profile?: ReturnType<typeof getOrbitalMissionProfile>,
 *   onReady?: () => void,
 *   onTelemetry?: (telemetry: ReturnType<typeof getDockingTelemetry>) => void,
 *   onEvent?: (event: string) => void
 * }} options
 */
export async function createDockingGame({
    parent,
    profile = getOrbitalMissionProfile('iss-docking'),
    onReady = () => {},
    onTelemetry = () => {},
    onEvent = () => {}
}) {
    const phaserModule = await import('phaser');
    const Phaser = /** @type {any} */ (phaserModule.default ?? phaserModule);
    const actions = createDockingInputState();
    let layout = createDockingLayout(parent.clientWidth || 960, parent.clientHeight || 540);
    let resolveReady;
    const ready = new Promise((resolve) => { resolveReady = resolve; });

    class DockingScene extends Phaser.Scene {
        constructor() {
            super(profile.id);
            this.simulation = createDockingState(profile.initialState);
            this.telemetryElapsed = 0;
            this.dockedEmitted = false;
        }

        init(data = {}) {
            if (data.simulation) this.simulation = createDockingState(data.simulation);
        }

        create() {
            drawBackdrop(this, layout);
            this.corridor = drawApproachCorridor(this, layout);
            this.station = profile.target === 'hubble' ? createHubble(this, layout) : createIss(this, layout);
            this.ship = createCourier(this);
            this.keys = this.input.keyboard?.addKeys({
                w: 'W', a: 'A', s: 'S', d: 'D',
                arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT',
                rotateLeft: 'Q', rotateRight: 'E', stabilize: 'SPACE'
            }) ?? {};
            const start = mapDockingPosition(this.simulation.position, layout);
            this.ship.setPosition(start.x, start.y);
            this.ship.setRotation(this.simulation.angle + (layout.orientation === 'portrait' ? -Math.PI / 2 : 0));
            onTelemetry(getDockingTelemetry(this.simulation));
            onReady();
            resolveReady();
        }

        update(_time, deltaMilliseconds) {
            const pointerInput = readDockingInput(actions, layout.orientation);
            const keyboardInput = readDockingKeyboardInput(this.keys, layout.orientation);
            const input = {
                horizontal: Math.max(-1, Math.min(1, pointerInput.horizontal
                    + keyboardInput.horizontal)),
                vertical: Math.max(-1, Math.min(1, pointerInput.vertical
                    + keyboardInput.vertical)),
                rotation: Math.max(-1, Math.min(1, pointerInput.rotation
                    + keyboardInput.rotation)),
                stabilize: pointerInput.stabilize || keyboardInput.stabilize
            };
            this.simulation = stepDocking(this.simulation, input, deltaMilliseconds / 1000, profile);
            const position = mapDockingPosition(this.simulation.position, layout);
            this.ship.setPosition(position.x, position.y);
            this.ship.setRotation(this.simulation.angle + (layout.orientation === 'portrait' ? -Math.PI / 2 : 0));
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
        width: layout.width,
        height: layout.height,
        backgroundColor: '#13294a',
        transparent: false,
        antialias: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: layout.width,
            height: layout.height
        },
        scene: [DockingScene],
        banner: false
    });
    await ready;

    const resizeObserver = typeof globalThis.ResizeObserver === 'function'
        ? new globalThis.ResizeObserver(() => {
            const nextLayout = createDockingLayout(parent.clientWidth || 960, parent.clientHeight || 540);
            if (nextLayout.orientation === layout.orientation) {
                game.scale.refresh();
                return;
            }
            const scene = game.scene.getScene(profile.id);
            const simulation = scene?.simulation;
            layout = nextLayout;
            game.scale.resize(layout.width, layout.height);
            scene?.scene.restart({ simulation });
        })
        : { observe() {}, disconnect() {} };
    resizeObserver.observe(parent);

    return Object.freeze({
        setAction: (action, active) => setDockingAction(actions, action, active),
        getState() {
            const scene = game.scene.getScene(profile.id);
            return scene?.simulation ? structuredClone(scene.simulation) : null;
        },
        advanceTime(milliseconds) {
            const scene = game.scene.getScene(profile.id);
            if (!scene?.simulation) return;
            const frameMilliseconds = 1000 / 60;
            const steps = Math.max(1, Math.round(milliseconds / frameMilliseconds));
            for (let index = 0; index < steps; index += 1) scene.update(0, frameMilliseconds);
        },
        destroy() {
            resizeObserver.disconnect();
            game.destroy(true);
        }
    });
}
