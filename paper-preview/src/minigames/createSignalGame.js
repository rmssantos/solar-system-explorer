import { createSignalState, getSignalTelemetry, stepSignal } from './signalSimulation.js';

const SIGNAL_ACTIONS = Object.freeze(['forward', 'reverse', 'up', 'down', 'stabilize']);

export function createSignalLayout(width = 960, height = 540) {
    const portrait = height > width * 1.08;
    return Object.freeze({
        orientation: portrait ? 'portrait' : 'landscape',
        width: portrait ? 540 : 960,
        height: portrait ? 960 : 540,
        relayX: portrait ? 270 : 300,
        relayY: portrait ? 530 : 300,
        marsX: portrait ? 435 : 900,
        marsY: portrait ? 180 : 350,
        marsRadius: portrait ? 135 : 230
    });
}

export function createSignalCalibrationLayout(layout) {
    return Object.freeze({
        x: layout.orientation === 'portrait' ? layout.width / 2 : 195,
        y: layout.orientation === 'portrait' ? 360 : 165,
        width: layout.orientation === 'portrait' ? 420 : 310,
        height: 114
    });
}

export function createSignalInputState() {
    return Object.fromEntries(SIGNAL_ACTIONS.map((action) => [action, false]));
}

export function setSignalAction(state, action, active) {
    if (!Object.prototype.hasOwnProperty.call(state, action)) return false;
    state[action] = Boolean(active);
    return true;
}

export function readSignalInput(state) {
    return {
        horizontal: Number(Boolean(state.forward)) - Number(Boolean(state.reverse)),
        vertical: Number(Boolean(state.down)) - Number(Boolean(state.up)),
        transmit: Boolean(state.stabilize)
    };
}

function keyDown(key) {
    return Boolean(key?.isDown);
}

export function readSignalKeyboardInput(keys = {}) {
    return {
        horizontal: Number(keyDown(keys.d) || keyDown(keys.arrowRight))
            - Number(keyDown(keys.a) || keyDown(keys.arrowLeft)),
        vertical: Number(keyDown(keys.s) || keyDown(keys.arrowDown))
            - Number(keyDown(keys.w) || keyDown(keys.arrowUp)),
        transmit: keyDown(keys.transmit)
    };
}

function drawBackdrop(scene, layout) {
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x13294a, 1);
    backdrop.fillRect(0, 0, layout.width, layout.height);
    for (let index = 0; index < 72; index += 1) {
        const x = (index * 181 + 37) % layout.width;
        const y = (index * 107 + 23) % layout.height;
        backdrop.fillStyle(index % 7 === 0 ? 0xf4c85f : 0xf2e4ba, 0.3 + (index % 4) * 0.14);
        backdrop.fillCircle(x, y, index % 11 === 0 ? 2.3 : 1.1);
    }
    const mars = scene.add.graphics();
    mars.fillStyle(0x071021, 0.42);
    mars.fillCircle(layout.marsX + 10, layout.marsY + 12, layout.marsRadius);
    mars.fillStyle(0xc85e42, 1);
    mars.fillCircle(layout.marsX, layout.marsY, layout.marsRadius);
    mars.fillStyle(0x9b4437, 0.7);
    mars.fillEllipse(layout.marsX - layout.marsRadius * 0.28, layout.marsY + layout.marsRadius * 0.18,
        layout.marsRadius * 0.72, layout.marsRadius * 0.22);
    mars.fillEllipse(layout.marsX + layout.marsRadius * 0.15, layout.marsY - layout.marsRadius * 0.32,
        layout.marsRadius * 0.5, layout.marsRadius * 0.16);
    mars.fillStyle(0xf2e4ba, 0.72);
    mars.fillEllipse(layout.marsX, layout.marsY - layout.marsRadius * 0.84,
        layout.marsRadius * 0.82, layout.marsRadius * 0.18);
    mars.lineStyle(7, 0x2b2f3a, 1);
    mars.strokeCircle(layout.marsX, layout.marsY, layout.marsRadius);
    return mars;
}

function createRelay(scene, layout) {
    const relay = scene.add.container(layout.relayX, layout.relayY);
    const shadow = scene.add.graphics({ x: 8, y: 9 });
    shadow.fillStyle(0x071021, 0.5);
    shadow.fillRoundedRect(-54, 40, 108, 38, 7);
    const base = scene.add.graphics();
    base.fillStyle(0x4f8177, 1);
    base.fillRoundedRect(-54, 40, 108, 38, 7);
    base.fillStyle(0xd5634d, 1);
    base.fillRect(-12, 2, 24, 45);
    base.lineStyle(4, 0x2b2f3a, 1);
    base.strokeRoundedRect(-54, 40, 108, 38, 7);
    base.strokeRect(-12, 2, 24, 45);
    const dish = scene.add.container(0, 0);
    const bowl = scene.add.graphics();
    bowl.fillStyle(0xf2e4ba, 1);
    bowl.slice(0, 0, 72, Math.PI * 0.72, Math.PI * 1.28, false);
    bowl.fillPath();
    bowl.lineStyle(4, 0x2b2f3a, 1);
    bowl.beginPath();
    bowl.arc(0, 0, 72, Math.PI * 0.72, Math.PI * 1.28, false);
    bowl.strokePath();
    bowl.lineBetween(0, -56, 0, 56);
    bowl.fillStyle(0xf4c85f, 1);
    bowl.fillCircle(25, 0, 7);
    bowl.lineStyle(3, 0x2b2f3a, 1);
    bowl.lineBetween(0, 0, 25, 0);
    dish.add(bowl);
    relay.add([shadow, base, dish]);
    relay.dish = dish;
    return relay;
}

function createCalibrationCard(scene, layout) {
    const calibrationLayout = createSignalCalibrationLayout(layout);
    const { x, y, width } = calibrationLayout;
    const card = scene.add.container(x, y);
    const paper = scene.add.graphics();
    paper.fillStyle(0x071021, 0.3);
    paper.fillRoundedRect(-width / 2 + 6, -57 + 8, width, 114, 10);
    paper.fillStyle(0xf2e4ba, 0.94);
    paper.fillRoundedRect(-width / 2, -57, width, 114, 10);
    paper.lineStyle(4, 0xa67e45, 1);
    paper.strokeRoundedRect(-width / 2, -57, width, 114, 10);
    paper.lineStyle(2, 0x2b2f3a, 0.4);
    paper.lineBetween(-width / 2 + 35, -18, width / 2 - 35, -18);
    paper.lineBetween(-width / 2 + 35, 30, width / 2 - 35, 30);
    const angleNeedle = scene.add.graphics();
    angleNeedle.fillStyle(0xd5634d, 1);
    angleNeedle.fillTriangle(-7, -25, 7, -25, 0, -8);
    const frequencyNeedle = scene.add.graphics();
    frequencyNeedle.fillStyle(0x4f8177, 1);
    frequencyNeedle.fillTriangle(-7, 23, 7, 23, 0, 7);
    const lock = scene.add.graphics();
    card.add([paper, angleNeedle, frequencyNeedle, lock]);
    card.angleNeedle = angleNeedle;
    card.frequencyNeedle = frequencyNeedle;
    card.lock = lock;
    card.trackWidth = width - 70;
    card.lockX = -width / 2 + 35;
    return card;
}

function drawSignalWaves(graphics, layout, simulation, time) {
    graphics.clear();
    const telemetry = getSignalTelemetry(simulation);
    const tuned = telemetry.primarySafe && telemetry.secondarySafe;
    const alpha = simulation.transmitting ? (tuned ? 0.9 : 0.46) : 0.16;
    const color = tuned ? 0xf4c85f : 0x4f8177;
    graphics.lineStyle(simulation.transmitting ? 5 : 3, color, alpha);
    const direction = layout.orientation === 'portrait' ? -0.7 : -0.14;
    const startX = layout.relayX + Math.cos(direction) * 55;
    const startY = layout.relayY + Math.sin(direction) * 55;
    const distance = Math.hypot(layout.marsX - startX, layout.marsY - startY);
    const angle = Math.atan2(layout.marsY - startY, layout.marsX - startX);
    for (let index = 0; index < 5; index += 1) {
        const progress = ((time / 900) + index / 5) % 1;
        const x = startX + Math.cos(angle) * distance * progress;
        const y = startY + Math.sin(angle) * distance * progress;
        graphics.strokeCircle(x, y, 10 + progress * 24);
    }
}

/**
 * @param {{ parent: HTMLElement, profile?: object, onReady?: () => void, onTelemetry?: (value: object) => void, onEvent?: (event: string) => void }} options
 */
export async function createSignalGame({
    parent,
    profile = {},
    onReady = () => {},
    onTelemetry = () => {},
    onEvent = () => {}
}) {
    const phaserModule = await import('phaser');
    const Phaser = /** @type {any} */ (phaserModule.default ?? phaserModule);
    const actions = createSignalInputState();
    let layout = createSignalLayout(parent.clientWidth || 960, parent.clientHeight || 540);
    let resolveReady;
    const ready = new Promise((resolve) => { resolveReady = resolve; });
    const sceneKey = profile.id ?? 'mars-relay';

    class SignalScene extends Phaser.Scene {
        constructor() {
            super(sceneKey);
            this.simulation = createSignalState(profile.initialState);
            this.telemetryElapsed = 0;
            this.completedEmitted = false;
        }

        init(data = {}) {
            if (data.simulation) this.simulation = createSignalState(data.simulation);
        }

        create() {
            drawBackdrop(this, layout);
            this.waves = this.add.graphics();
            this.relay = createRelay(this, layout);
            this.calibration = createCalibrationCard(this, layout);
            this.keys = this.input.keyboard?.addKeys({
                w: 'W', a: 'A', s: 'S', d: 'D',
                arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT',
                transmit: 'SPACE'
            }) ?? {};
            onTelemetry(getSignalTelemetry(this.simulation));
            onReady();
            resolveReady();
        }

        update(time, deltaMilliseconds) {
            const pointer = readSignalInput(actions);
            const keyboard = readSignalKeyboardInput(this.keys);
            const input = {
                horizontal: Math.max(-1, Math.min(1, pointer.horizontal + keyboard.horizontal)),
                vertical: Math.max(-1, Math.min(1, pointer.vertical + keyboard.vertical)),
                transmit: pointer.transmit || keyboard.transmit
            };
            this.simulation = stepSignal(this.simulation, input, deltaMilliseconds / 1000);
            const telemetry = getSignalTelemetry(this.simulation);
            this.relay.dish.rotation = -0.32 - this.simulation.angleError * 0.72;
            this.calibration.angleNeedle.x = this.simulation.angleError * this.calibration.trackWidth / 2;
            this.calibration.frequencyNeedle.x = this.simulation.frequencyError * this.calibration.trackWidth / 2;
            this.calibration.lock.clear();
            this.calibration.lock.fillStyle(0xf4c85f, 1);
            this.calibration.lock.fillRoundedRect(
                this.calibration.lockX,
                42,
                telemetry.lockPercent * this.calibration.trackWidth,
                9,
                4
            );
            drawSignalWaves(this.waves, layout, this.simulation, time);
            this.telemetryElapsed += deltaMilliseconds;
            if (this.telemetryElapsed >= 80 || this.simulation.event) {
                this.telemetryElapsed = 0;
                onTelemetry(telemetry);
            }
            if (this.simulation.event === 'signal-complete' && !this.completedEmitted) {
                this.completedEmitted = true;
                onEvent('signal-complete');
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
        scene: [SignalScene],
        banner: false
    });
    await ready;
    const resizeObserver = typeof globalThis.ResizeObserver === 'function'
        ? new globalThis.ResizeObserver(() => {
            const nextLayout = createSignalLayout(parent.clientWidth || 960, parent.clientHeight || 540);
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
        setAction: (action, active) => setSignalAction(actions, action, active),
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
