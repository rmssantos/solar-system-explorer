import { SWEEP_LIMITS, createSweepState, getSweepTelemetry, stepSweep } from './sweepSimulation.js';

const SWEEP_ACTIONS = Object.freeze(['forward', 'reverse', 'up', 'down', 'stabilize']);

export function createSweepLayout(width = 960, height = 540) {
    const portrait = height > width * 1.08;
    return Object.freeze({
        orientation: portrait ? 'portrait' : 'landscape',
        width: portrait ? 540 : 960,
        height: portrait ? 960 : 540,
        marginX: portrait ? 62 : 78,
        marginY: portrait ? 104 : 62
    });
}

export function createSweepInputState() {
    return Object.fromEntries(SWEEP_ACTIONS.map((action) => [action, false]));
}

export function setSweepAction(state, action, active) {
    if (!Object.prototype.hasOwnProperty.call(state, action)) return false;
    state[action] = Boolean(active);
    return true;
}

export function readSweepInput(state) {
    return {
        horizontal: Number(Boolean(state.forward)) - Number(Boolean(state.reverse)),
        vertical: Number(Boolean(state.down)) - Number(Boolean(state.up)),
        stabilize: Boolean(state.stabilize)
    };
}

function keyDown(key) {
    return Boolean(key?.isDown);
}

export function readSweepKeyboardInput(keys = {}) {
    return {
        horizontal: Number(keyDown(keys.d) || keyDown(keys.arrowRight))
            - Number(keyDown(keys.a) || keyDown(keys.arrowLeft)),
        vertical: Number(keyDown(keys.s) || keyDown(keys.arrowDown))
            - Number(keyDown(keys.w) || keyDown(keys.arrowUp)),
        stabilize: keyDown(keys.stabilize)
    };
}

export function mapSweepPosition(position, layout = createSweepLayout()) {
    const usableWidth = layout.width - layout.marginX * 2;
    const usableHeight = layout.height - layout.marginY * 2;
    return {
        x: layout.width / 2 + (position.x / SWEEP_LIMITS.maxX) * usableWidth / 2,
        y: layout.height / 2 + (position.y / SWEEP_LIMITS.maxY) * usableHeight / 2
    };
}

function drawBackdrop(scene, layout) {
    const paper = scene.add.graphics();
    paper.fillStyle(0x13294a, 1);
    paper.fillRect(0, 0, layout.width, layout.height);
    for (let index = 0; index < 76; index += 1) {
        const x = (index * 173 + 29) % layout.width;
        const y = (index * 97 + 41) % layout.height;
        paper.fillStyle(index % 8 === 0 ? 0xf4c85f : 0xf2e4ba, 0.28 + (index % 4) * 0.14);
        paper.fillCircle(x, y, index % 9 === 0 ? 2.2 : 1.1);
    }
    const moon = scene.add.graphics();
    const moonX = layout.orientation === 'portrait' ? layout.width + 106 : layout.width + 50;
    const moonY = layout.orientation === 'portrait' ? layout.height * 0.54 : layout.height + 155;
    const radius = layout.orientation === 'portrait' ? 300 : 370;
    moon.fillStyle(0x0b172c, 0.4);
    moon.fillCircle(moonX + 12, moonY + 12, radius);
    moon.fillStyle(0xc7b895, 1);
    moon.fillCircle(moonX, moonY, radius);
    moon.fillStyle(0x9d927a, 0.55);
    moon.fillCircle(moonX - radius * 0.52, moonY - radius * 0.38, radius * 0.11);
    moon.fillCircle(moonX - radius * 0.24, moonY + radius * 0.22, radius * 0.07);
    moon.lineStyle(7, 0x2b2f3a, 1);
    moon.strokeCircle(moonX, moonY, radius);
    const orbit = scene.add.graphics();
    orbit.lineStyle(2, 0xf2e4ba, 0.17);
    orbit.strokeRoundedRect(layout.marginX - 18, layout.marginY - 18,
        layout.width - (layout.marginX - 18) * 2, layout.height - (layout.marginY - 18) * 2, 64);
    return orbit;
}

function createCourier(scene) {
    const ship = scene.add.container(0, 0);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x071021, 0.48);
    shadow.fillTriangle(-26, -18, -26, 18, 34, 0);
    shadow.setPosition(5, 7);
    const hull = scene.add.graphics();
    hull.fillStyle(0xf2e4ba, 1);
    hull.fillTriangle(-28, -18, -28, 18, 34, 0);
    hull.fillStyle(0xd5634d, 1);
    hull.fillTriangle(-18, -12, -39, -29, 5, -12);
    hull.fillTriangle(-18, 12, -39, 29, 5, 12);
    hull.fillStyle(0x4f8177, 1);
    hull.fillCircle(7, 0, 7);
    hull.lineStyle(3, 0x2b2f3a, 1);
    hull.strokeTriangle(-28, -18, -28, 18, 34, 0);
    hull.strokeCircle(7, 0, 7);
    const exhaust = scene.add.graphics();
    exhaust.fillStyle(0xf4c85f, 0.92);
    exhaust.fillTriangle(-30, -7, -54, 0, -30, 7);
    ship.add([shadow, exhaust, hull]);
    ship.exhaust = exhaust;
    return ship;
}

function createTransmitter(scene, item, layout, index) {
    const position = mapSweepPosition(item, layout);
    const marker = scene.add.container(position.x, position.y);
    const ring = scene.add.graphics();
    ring.lineStyle(3, 0xf4c85f, 0.52);
    ring.strokeCircle(0, 0, 26);
    ring.strokeCircle(0, 0, 36);
    const tile = scene.add.graphics();
    tile.fillStyle(0xf4c85f, 1);
    tile.fillPoints([{ x: -17, y: -12 }, { x: 0, y: -21 }, { x: 17, y: -12 }, { x: 17, y: 12 }, { x: 0, y: 21 }, { x: -17, y: 12 }], true);
    tile.lineStyle(3, 0x7c5a2d, 1);
    tile.strokePoints([{ x: -17, y: -12 }, { x: 0, y: -21 }, { x: 17, y: -12 }, { x: 17, y: 12 }, { x: 0, y: 21 }, { x: -17, y: 12 }], true);
    tile.fillStyle(0x4f8177, 1);
    tile.fillCircle(0, 3, 5);
    tile.fillRect(-2, -10, 4, 13);
    marker.add([ring, tile]);
    marker.ring = ring;
    marker.pulseOffset = index * 0.7;
    return marker;
}

function createDebris(scene, item, layout, index) {
    const position = mapSweepPosition(item, layout);
    const rock = scene.add.graphics({ x: position.x, y: position.y });
    const radius = 11 + item.radius * 70;
    rock.fillStyle(index % 2 ? 0x4b4a50 : 0x343640, 1);
    rock.fillPoints([
        { x: -radius, y: -radius * 0.25 }, { x: -radius * 0.28, y: -radius },
        { x: radius * 0.8, y: -radius * 0.55 }, { x: radius, y: radius * 0.35 },
        { x: radius * 0.12, y: radius }, { x: -radius * 0.82, y: radius * 0.5 }
    ], true);
    rock.lineStyle(3, 0x1c202c, 1);
    rock.strokePoints([
        { x: -radius, y: -radius * 0.25 }, { x: -radius * 0.28, y: -radius },
        { x: radius * 0.8, y: -radius * 0.55 }, { x: radius, y: radius * 0.35 },
        { x: radius * 0.12, y: radius }, { x: -radius * 0.82, y: radius * 0.5 }
    ], true);
    rock.rotation = index * 0.53;
    return rock;
}

/**
 * @param {{ parent: HTMLElement, profile?: object, onReady?: () => void, onTelemetry?: (value: object) => void, onEvent?: (event: string) => void }} options
 */
export async function createSweepGame({
    parent,
    profile = {},
    onReady = () => {},
    onTelemetry = () => {},
    onEvent = () => {}
}) {
    const phaserModule = await import('phaser');
    const Phaser = /** @type {any} */ (phaserModule.default ?? phaserModule);
    const actions = createSweepInputState();
    let layout = createSweepLayout(parent.clientWidth || 960, parent.clientHeight || 540);
    let resolveReady;
    const ready = new Promise((resolve) => { resolveReady = resolve; });
    const sceneKey = profile.id ?? 'lunar-sweep';

    class SweepScene extends Phaser.Scene {
        constructor() {
            super(sceneKey);
            this.simulation = createSweepState(profile.initialState);
            this.telemetryElapsed = 0;
            this.completedEmitted = false;
        }

        init(data = {}) {
            if (data.simulation) this.simulation = createSweepState(data.simulation);
        }

        create() {
            drawBackdrop(this, layout);
            this.transmitters = this.simulation.transmitters.map((item, index) => createTransmitter(this, item, layout, index));
            this.debris = this.simulation.debris.map((item, index) => createDebris(this, item, layout, index));
            this.ship = createCourier(this);
            const shipPosition = mapSweepPosition(this.simulation.position, layout);
            this.ship.setPosition(shipPosition.x, shipPosition.y);
            this.keys = this.input.keyboard?.addKeys({
                w: 'W', a: 'A', s: 'S', d: 'D',
                arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT',
                stabilize: 'SPACE'
            }) ?? {};
            onTelemetry(getSweepTelemetry(this.simulation));
            onReady();
            resolveReady();
        }

        update(time, deltaMilliseconds) {
            const pointer = readSweepInput(actions);
            const keyboard = readSweepKeyboardInput(this.keys);
            const input = {
                horizontal: Math.max(-1, Math.min(1, pointer.horizontal + keyboard.horizontal)),
                vertical: Math.max(-1, Math.min(1, pointer.vertical + keyboard.vertical)),
                stabilize: pointer.stabilize || keyboard.stabilize
            };
            this.simulation = stepSweep(this.simulation, input, deltaMilliseconds / 1000);
            const position = mapSweepPosition(this.simulation.position, layout);
            this.ship.setPosition(position.x, position.y);
            const speed = Math.hypot(this.simulation.velocity.x, this.simulation.velocity.y);
            if (speed > 0.025) this.ship.rotation = Math.atan2(this.simulation.velocity.y, this.simulation.velocity.x);
            this.ship.exhaust.setVisible((Math.abs(input.horizontal) + Math.abs(input.vertical)) > 0 && this.simulation.phase !== 'complete');
            this.transmitters.forEach((marker, index) => {
                marker.setVisible(!this.simulation.transmitters[index].collected);
                marker.ring.alpha = 0.4 + Math.sin(time / 260 + marker.pulseOffset) * 0.22;
            });
            this.debris.forEach((rock, index) => { rock.rotation += (index % 2 ? 1 : -1) * deltaMilliseconds * 0.00018; });
            this.telemetryElapsed += deltaMilliseconds;
            if (this.telemetryElapsed >= 80 || this.simulation.event) {
                this.telemetryElapsed = 0;
                onTelemetry(getSweepTelemetry(this.simulation));
            }
            if (this.simulation.event === 'transmitter-collected') onEvent('transmitter-collected');
            if (this.simulation.event === 'debris-hit') {
                onEvent('debris-hit');
                if (!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) this.cameras.main.shake(130, 0.005);
            }
            if (this.simulation.event === 'sweep-complete' && !this.completedEmitted) {
                this.completedEmitted = true;
                onEvent('sweep-complete');
            }
        }
    }

    const game = new Phaser.Game({
        type: Phaser.CANVAS,
        parent,
        width: layout.width,
        height: layout.height,
        backgroundColor: '#13294a',
        antialias: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: layout.width,
            height: layout.height
        },
        scene: [SweepScene],
        banner: false
    });
    await ready;
    const resizeObserver = typeof globalThis.ResizeObserver === 'function'
        ? new globalThis.ResizeObserver(() => {
            const nextLayout = createSweepLayout(parent.clientWidth || 960, parent.clientHeight || 540);
            if (nextLayout.orientation === layout.orientation) {
                game.scale.refresh();
                return;
            }
            const scene = game.scene.getScene(sceneKey);
            const simulation = scene?.simulation;
            layout = nextLayout;
            game.scale.resize(layout.width, layout.height);
            scene?.scene.restart({ simulation });
        })
        : { observe() {}, disconnect() {} };
    resizeObserver.observe(parent);

    return Object.freeze({
        setAction: (action, active) => setSweepAction(actions, action, active),
        getState() {
            const scene = game.scene.getScene(sceneKey);
            return scene?.simulation ? structuredClone(scene.simulation) : null;
        },
        advanceTime(milliseconds) {
            const scene = game.scene.getScene(sceneKey);
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
