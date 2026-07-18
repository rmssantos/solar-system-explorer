import {
    createSlingshotState,
    getSlingshotTelemetry,
    stepSlingshot
} from './slingshotSimulation.js';

const SLINGSHOT_ACTIONS = Object.freeze(['forward', 'reverse', 'up', 'down', 'stabilize']);

export function createSlingshotLayout(width = 960, height = 540) {
    const portrait = height > width * 1.08;
    return Object.freeze(portrait ? {
        orientation: 'portrait', width: 540, height: 960,
        jupiterX: 270, jupiterY: 430, jupiterRadius: 174,
        shipX: 62, shipY: 568, exitX: 478, exitY: 116
    } : {
        orientation: 'landscape', width: 960, height: 540,
        jupiterX: 535, jupiterY: 292, jupiterRadius: 164,
        shipX: 72, shipY: 438, exitX: 900, exitY: 72
    });
}

export function createSlingshotInputState() {
    return Object.fromEntries(SLINGSHOT_ACTIONS.map((action) => [action, false]));
}

export function setSlingshotAction(state, action, active) {
    if (!Object.prototype.hasOwnProperty.call(state, action)) return false;
    state[action] = Boolean(active);
    return true;
}

export function readSlingshotInput(state) {
    return {
        horizontal: Number(Boolean(state.forward)) - Number(Boolean(state.reverse)),
        vertical: Number(Boolean(state.up)) - Number(Boolean(state.down)),
        commit: Boolean(state.stabilize)
    };
}

function keyDown(key) { return Boolean(key?.isDown); }

export function readSlingshotKeyboardInput(keys = {}) {
    return {
        horizontal: Number(keyDown(keys.d) || keyDown(keys.arrowRight))
            - Number(keyDown(keys.a) || keyDown(keys.arrowLeft)),
        vertical: Number(keyDown(keys.w) || keyDown(keys.arrowUp))
            - Number(keyDown(keys.s) || keyDown(keys.arrowDown)),
        commit: keyDown(keys.commit)
    };
}

function drawStarfield(scene, layout) {
    const background = scene.add.graphics();
    background.fillStyle(0x071021, 1);
    background.fillRect(0, 0, layout.width, layout.height);
    for (let index = 0; index < 86; index += 1) {
        const x = (index * 173 + 41) % layout.width;
        const y = (index * 97 + 29) % layout.height;
        const large = index % 17 === 0;
        background.fillStyle(large ? 0xd7f2ec : 0xf4e6bd, 0.42 + (index % 4) * 0.14);
        if (large) {
            background.fillTriangle(x, y - 5, x + 3, y, x, y + 5);
            background.fillTriangle(x - 5, y, x, y - 3, x + 5, y);
        } else background.fillCircle(x, y, index % 9 === 0 ? 2 : 1);
    }
    return background;
}

function createJupiter(scene, layout) {
    const { jupiterX: x, jupiterY: y, jupiterRadius: radius } = layout;
    const planet = scene.add.container(x, y);
    const shadow = scene.add.graphics({ x: 11, y: 13 });
    shadow.fillStyle(0x020713, 0.6);
    shadow.fillCircle(0, 0, radius + 8);
    const body = scene.add.graphics();
    body.fillStyle(0xd76a4d, 1);
    body.fillCircle(0, 0, radius);
    const bands = [
        [-0.64, 0.25, 0xf0c48f], [-0.43, 0.19, 0xb95342], [-0.23, 0.22, 0xf4dfb6],
        [-0.02, 0.17, 0xc65a45], [0.17, 0.22, 0xe99a62], [0.39, 0.18, 0xf2d4a5],
        [0.59, 0.2, 0xa8473d]
    ];
    for (const [offset, height, color] of bands) {
        body.fillStyle(color, 0.96);
        body.fillEllipse(0, radius * offset, radius * 1.84, radius * height);
    }
    body.fillStyle(0x9f3f38, 1);
    body.fillEllipse(radius * 0.28, radius * 0.36, radius * 0.52, radius * 0.25);
    body.fillStyle(0xe7855d, 1);
    body.fillEllipse(radius * 0.28, radius * 0.36, radius * 0.34, radius * 0.14);
    body.lineStyle(Math.max(7, radius * 0.055), 0x202438, 1);
    body.strokeCircle(0, 0, radius);
    body.lineStyle(2, 0xf8e8c1, 0.28);
    body.strokeEllipse(-radius * 0.18, -radius * 0.48, radius * 1.35, radius * 0.12);
    body.strokeEllipse(radius * 0.08, radius * 0.08, radius * 1.5, radius * 0.1);
    planet.add([shadow, body]);
    return planet;
}

function createCourier(scene) {
    const ship = scene.add.container(0, 0);
    const shadow = scene.add.graphics({ x: 5, y: 6 });
    shadow.fillStyle(0x020713, 0.55);
    shadow.fillTriangle(-31, 18, 35, 0, -31, -18);
    const hull = scene.add.graphics();
    hull.fillStyle(0xf2e4ba, 1);
    hull.lineStyle(5, 0x202438, 1);
    hull.fillTriangle(-32, 19, 38, 0, -32, -19);
    hull.strokeTriangle(-32, 19, 38, 0, -32, -19);
    hull.fillStyle(0xd5634d, 1);
    hull.lineStyle(4, 0x202438, 1);
    hull.fillTriangle(-24, -13, -42, -29, 2, -11);
    hull.strokeTriangle(-24, -13, -42, -29, 2, -11);
    hull.fillTriangle(-24, 13, -42, 29, 2, 11);
    hull.strokeTriangle(-24, 13, -42, 29, 2, 11);
    hull.fillStyle(0x4f9dad, 1);
    hull.fillCircle(7, 0, 9);
    hull.lineStyle(3, 0x202438, 1);
    hull.strokeCircle(7, 0, 9);
    const exhaust = scene.add.graphics();
    exhaust.fillStyle(0x66c4cf, 0.85);
    exhaust.fillTriangle(-31, -9, -54, 0, -31, 9);
    ship.add([shadow, exhaust, hull]);
    ship.setScale(0.9);
    ship.exhaust = exhaust;
    return ship;
}

function routePoints(layout, simulation) {
    const points = [{ x: layout.shipX, y: layout.shipY }];
    const radius = layout.jupiterRadius * (1.05 + simulation.flybyDistance * 0.55);
    const angleShift = simulation.angleError * 0.48;
    const startAngle = layout.orientation === 'portrait' ? 2.3 : 2.55;
    const endAngle = layout.orientation === 'portrait' ? 6.0 : 5.9;
    const segments = 38;
    for (let index = 0; index <= segments; index += 1) {
        const progress = index / segments;
        const angle = startAngle + (endAngle - startAngle) * progress + angleShift * progress;
        points.push({
            x: layout.jupiterX + Math.cos(angle) * radius,
            y: layout.jupiterY + Math.sin(angle) * radius
        });
    }
    points.push({ x: layout.exitX, y: layout.exitY + simulation.angleError * 120 });
    return points;
}

function drawRoute(graphics, arrows, layout, simulation) {
    graphics.clear();
    arrows.clear();
    const telemetry = getSlingshotTelemetry(simulation);
    const safe = telemetry.primarySafe && telemetry.secondarySafe;
    const points = routePoints(layout, simulation);
    const drawPolyline = (width, color, alpha) => {
        graphics.lineStyle(width, color, alpha);
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (const point of points.slice(1)) graphics.lineTo(point.x, point.y);
        graphics.strokePath();
    };
    drawPolyline(14, 0x171829, 0.9);
    drawPolyline(8, safe ? 0x74d1c7 : 0xd5634d, 1);
    drawPolyline(3, 0xf5e9c5, 0.88);

    const corridorRadius = layout.jupiterRadius * 1.32;
    graphics.lineStyle(18, 0x4f8775, 0.18);
    graphics.beginPath();
    graphics.arc(layout.jupiterX, layout.jupiterY, corridorRadius, 2.25, 6.12, false);
    graphics.strokePath();
    graphics.lineStyle(12, 0xd5634d, simulation.flybyDistance < 0.34 ? 0.62 : 0.16);
    graphics.strokeCircle(layout.jupiterX, layout.jupiterY, layout.jupiterRadius * 1.08);

    const arrowAlpha = 0.25 + telemetry.boostPercent * 0.75;
    for (let index = 0; index < 3; index += 1) {
        const x = layout.exitX - 28 - index * 30;
        const y = layout.exitY + index * 11;
        arrows.fillStyle(0x74d1c7, arrowAlpha);
        arrows.fillTriangle(x, y, x - 18, y - 9, x - 18, y + 9);
        arrows.lineStyle(3, 0x171829, arrowAlpha);
        arrows.strokeTriangle(x, y, x - 18, y - 9, x - 18, y + 9);
    }
    return points;
}

function placeCourier(ship, points, progress) {
    const index = Math.min(points.length - 2, Math.floor(progress * (points.length - 1)));
    const local = progress * (points.length - 1) - index;
    const current = points[index];
    const next = points[index + 1];
    ship.setPosition(
        current.x + (next.x - current.x) * local,
        current.y + (next.y - current.y) * local
    );
    ship.setRotation(Math.atan2(next.y - current.y, next.x - current.x));
    ship.exhaust.setAlpha(0.25 + progress * 0.75);
}

/**
 * @param {{ parent: HTMLElement, profile?: object, onReady?: () => void, onTelemetry?: (value: object) => void, onEvent?: (event: string) => void }} options
 */
export async function createSlingshotGame({
    parent,
    profile = {},
    onReady = () => {},
    onTelemetry = () => {},
    onEvent = () => {}
}) {
    const phaserModule = await import('phaser');
    const Phaser = /** @type {any} */ (phaserModule.default ?? phaserModule);
    const actions = createSlingshotInputState();
    let layout = createSlingshotLayout(parent.clientWidth || 960, parent.clientHeight || 540);
    let resolveReady;
    const ready = new Promise((resolve) => { resolveReady = resolve; });
    const sceneKey = profile.id ?? 'jupiter-slingshot';

    class SlingshotScene extends Phaser.Scene {
        constructor() {
            super(sceneKey);
            this.simulation = createSlingshotState(profile.initialState);
            this.telemetryElapsed = 0;
            this.lastEvent = null;
        }

        init(data = {}) {
            if (data.simulation) this.simulation = createSlingshotState(data.simulation);
        }

        create() {
            drawStarfield(this, layout);
            this.route = this.add.graphics();
            createJupiter(this, layout);
            this.arrows = this.add.graphics();
            this.ship = createCourier(this);
            this.keys = this.input.keyboard?.addKeys({
                w: 'W', a: 'A', s: 'S', d: 'D',
                arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT',
                commit: 'SPACE'
            }) ?? {};
            const points = drawRoute(this.route, this.arrows, layout, this.simulation);
            placeCourier(this.ship, points, 0);
            onTelemetry(getSlingshotTelemetry(this.simulation));
            onReady();
            resolveReady();
        }

        update(_time, deltaMilliseconds) {
            const pointer = readSlingshotInput(actions);
            const keyboard = readSlingshotKeyboardInput(this.keys);
            this.simulation = stepSlingshot(this.simulation, {
                horizontal: Math.max(-1, Math.min(1, pointer.horizontal + keyboard.horizontal)),
                vertical: Math.max(-1, Math.min(1, pointer.vertical + keyboard.vertical)),
                commit: pointer.commit || keyboard.commit
            }, deltaMilliseconds / 1000);
            const telemetry = getSlingshotTelemetry(this.simulation);
            const points = drawRoute(this.route, this.arrows, layout, this.simulation);
            placeCourier(this.ship, points, telemetry.boostPercent);
            this.telemetryElapsed += deltaMilliseconds;
            if (this.telemetryElapsed >= 80 || this.simulation.event) {
                this.telemetryElapsed = 0;
                onTelemetry(telemetry);
            }
            if (this.simulation.event && this.simulation.event !== this.lastEvent) {
                onEvent(this.simulation.event);
                this.lastEvent = this.simulation.event;
            } else if (!this.simulation.event) this.lastEvent = null;
        }
    }

    const game = new Phaser.Game({
        type: Phaser.CANVAS,
        parent,
        width: layout.width,
        height: layout.height,
        backgroundColor: '#071021',
        antialias: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: layout.width,
            height: layout.height
        },
        scene: [SlingshotScene],
        banner: false
    });
    await ready;
    const resizeObserver = typeof globalThis.ResizeObserver === 'function'
        ? new globalThis.ResizeObserver(() => {
            const nextLayout = createSlingshotLayout(parent.clientWidth || 960, parent.clientHeight || 540);
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
        setAction: (action, active) => setSlingshotAction(actions, action, active),
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
