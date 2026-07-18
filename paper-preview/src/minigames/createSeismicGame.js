import {
    SEISMIC_LIMITS,
    createSeismicState,
    getSeismicTelemetry,
    stepSeismic
} from './seismicSimulation.js';

const SEISMIC_ACTIONS = Object.freeze(['forward', 'reverse', 'up', 'down', 'stabilize']);

export function createSeismicLayout(width = 960, height = 540) {
    const portrait = height > width * 1.08;
    return Object.freeze({
        orientation: portrait ? 'portrait' : 'landscape',
        width: portrait ? 540 : 960,
        height: portrait ? 960 : 540,
        field: Object.freeze(portrait
            ? { x: 44, y: 170, width: 452, height: 330 }
            : { x: 52, y: 92, width: 540, height: 390 }),
        console: Object.freeze(portrait
            ? { x: 44, y: 520, width: 452, height: 250 }
            : { x: 620, y: 92, width: 288, height: 390 })
    });
}

export function createSeismicInputState() {
    return Object.fromEntries(SEISMIC_ACTIONS.map((action) => [action, false]));
}

export function setSeismicAction(state, action, active) {
    if (!Object.prototype.hasOwnProperty.call(state, action)) return false;
    state[action] = Boolean(active);
    return true;
}

export function readSeismicInput(state) {
    return {
        horizontal: Number(Boolean(state.forward)) - Number(Boolean(state.reverse)),
        vertical: Number(Boolean(state.down)) - Number(Boolean(state.up)),
        activate: Boolean(state.stabilize)
    };
}

function keyDown(key) {
    return Boolean(key?.isDown);
}

export function readSeismicKeyboardInput(keys = {}) {
    return {
        horizontal: Number(keyDown(keys.d) || keyDown(keys.arrowRight))
            - Number(keyDown(keys.a) || keyDown(keys.arrowLeft)),
        vertical: Number(keyDown(keys.s) || keyDown(keys.arrowDown))
            - Number(keyDown(keys.w) || keyDown(keys.arrowUp)),
        activate: keyDown(keys.activate)
    };
}

export function mapSeismicPosition(position, layout = createSeismicLayout()) {
    const field = layout.field;
    return Object.freeze({
        x: field.x + field.width / 2 + (position.x / SEISMIC_LIMITS.maxX) * (field.width * 0.43),
        y: field.y + field.height / 2 + (position.y / SEISMIC_LIMITS.maxY) * (field.height * 0.4)
    });
}

function drawPaperBackdrop(scene, layout) {
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x0b132b, 1);
    backdrop.fillRect(0, 0, layout.width, layout.height);
    for (let index = 0; index < 74; index += 1) {
        const x = (index * 173 + 31) % layout.width;
        const y = (index * 83 + 19) % layout.height;
        backdrop.fillStyle(index % 9 === 0 ? 0x9fd5e7 : 0xfff3cf, 0.22 + (index % 3) * 0.16);
        backdrop.fillCircle(x, y, index % 11 === 0 ? 2.1 : 1);
    }
    const field = layout.field;
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x05091a, 0.45);
    shadow.fillRoundedRect(field.x + 8, field.y + 10, field.width, field.height, 18);
    const moon = scene.add.graphics();
    moon.fillStyle(0xc7c1b2, 1);
    moon.fillRoundedRect(field.x, field.y, field.width, field.height, 18);
    moon.fillStyle(0xa9a394, 0.72);
    moon.fillEllipse(field.x + field.width * 0.18, field.y + field.height * 0.24, 94, 42);
    moon.fillEllipse(field.x + field.width * 0.73, field.y + field.height * 0.68, 128, 54);
    moon.fillStyle(0x8d887c, 0.42);
    moon.fillCircle(field.x + field.width * 0.46, field.y + field.height * 0.48, 28);
    moon.fillCircle(field.x + field.width * 0.84, field.y + field.height * 0.18, 19);
    moon.lineStyle(6, 0x292d38, 1);
    moon.strokeRoundedRect(field.x, field.y, field.width, field.height, 18);
    for (let row = 0; row < 7; row += 1) {
        moon.lineStyle(1, row % 2 ? 0xf6f1df : 0x77756f, 0.18);
        moon.lineBetween(field.x + 12, field.y + 30 + row * 57, field.x + field.width - 12, field.y + 24 + row * 57);
    }
}

function createTitle(scene, layout, language) {
    const pt = language !== 'en';
    const titleY = layout.orientation === 'portrait' ? 120 : 26;
    const instructionY = layout.orientation === 'portrait' ? 143 : 52;
    const kicker = scene.add.text(layout.width / 2, titleY, pt ? 'PISTA 1 · OUVE A LUA' : 'CLUE 1 · LISTEN TO THE MOON', {
        fontFamily: 'Arial', fontSize: layout.orientation === 'portrait' ? '17px' : '15px',
        fontStyle: 'bold', color: '#f4c85f', letterSpacing: 2
    }).setOrigin(0.5, 0);
    const instruction = scene.add.text(layout.width / 2, instructionY,
        pt ? 'Coloca 3 sensores afastados.' : 'Place 3 sensors far apart.', {
            fontFamily: 'Arial', fontSize: layout.orientation === 'portrait' ? '24px' : '20px',
            fontStyle: 'bold', color: '#fff3cf', align: 'center',
            wordWrap: { width: layout.width - 70 }
        }).setOrigin(0.5, 0);
    return { kicker, instruction };
}

function createSensor(scene, index) {
    const sensor = scene.add.container(0, 0);
    const shadow = scene.add.graphics({ x: 4, y: 5 });
    shadow.fillStyle(0x111522, 0.42);
    shadow.fillTriangle(-23, 18, 23, 18, 0, -17);
    const body = scene.add.graphics();
    body.fillStyle(index % 2 ? 0x4d8490 : 0xd5634d, 1);
    body.fillTriangle(-23, 18, 23, 18, 0, -17);
    body.fillStyle(0xfff0c4, 1);
    body.fillRect(-8, -5, 16, 18);
    body.lineStyle(3, 0x292d38, 1);
    body.strokeTriangle(-23, 18, 23, 18, 0, -17);
    body.lineBetween(0, -17, 0, -31);
    body.fillCircle(0, -33, 4);
    const number = scene.add.text(0, 5, String(index + 1), {
        fontFamily: 'Arial', fontSize: '11px', fontStyle: 'bold', color: '#292d38'
    }).setOrigin(0.5);
    sensor.add([shadow, body, number]);
    return sensor;
}

function drawConsole(scene, layout) {
    const area = layout.console;
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x05091a, 0.45);
    shadow.fillRoundedRect(area.x + 7, area.y + 8, area.width, area.height, 16);
    const paper = scene.add.graphics();
    paper.fillStyle(0xfff0c4, 1);
    paper.fillRoundedRect(area.x, area.y, area.width, area.height, 16);
    paper.lineStyle(5, 0x9d7942, 1);
    paper.strokeRoundedRect(area.x, area.y, area.width, area.height, 16);
    paper.fillStyle(0xd5634d, 1);
    paper.fillRect(area.x + 18, area.y - 7, Math.min(84, area.width * 0.3), 15);
    return paper;
}

function createSignalStrips(scene, layout) {
    const area = layout.console;
    const strips = [];
    const top = area.y + 38;
    const height = (area.height - 102) / 3;
    for (let index = 0; index < 3; index += 1) {
        const graphics = scene.add.graphics();
        strips.push({ graphics, y: top + index * height, height: height - 7 });
    }
    return strips;
}

function drawSignalStrip(strip, area, index, simulation, time) {
    const graphics = strip.graphics;
    graphics.clear();
    graphics.fillStyle(0xf9f4df, 1);
    graphics.fillRoundedRect(area.x + 16, strip.y, area.width - 32, strip.height, 6);
    graphics.lineStyle(1, 0x8bb2b6, 0.28);
    for (let line = 1; line < 5; line += 1) {
        const x = area.x + 16 + ((area.width - 32) / 5) * line;
        graphics.lineBetween(x, strip.y + 3, x, strip.y + strip.height - 3);
    }
    const centerY = strip.y + strip.height / 2;
    const clarity = getSeismicTelemetry(simulation).signalClarity;
    const phaseShift = simulation.phase === 'placing'
        ? 0.15 * index
        : simulation.alignmentOffset * (index - 1) * 0.28;
    graphics.lineStyle(2.5, [0xd5634d, 0x315d62, 0x4388b8][index], 1);
    graphics.beginPath();
    const width = area.width - 40;
    for (let point = 0; point <= 48; point += 1) {
        const progress = point / 48;
        const pulse = Math.exp(-Math.pow((progress - 0.53 - phaseShift) * 17, 2));
        const grain = Math.sin(point * 1.7 + time / 260 + index) * (simulation.phase === 'placing' ? 2 : 1.3);
        const amplitude = pulse * (8 + clarity * 20) * Math.sin(point * 3.5) + grain;
        const x = area.x + 20 + progress * width;
        const y = centerY - amplitude;
        if (point === 0) graphics.moveTo(x, y); else graphics.lineTo(x, y);
    }
    graphics.strokePath();
}

function drawCursor(graphics, position, valid) {
    graphics.clear();
    graphics.lineStyle(3, valid ? 0xf4c85f : 0xd5634d, 0.95);
    graphics.strokeCircle(position.x, position.y, 25);
    graphics.lineBetween(position.x - 34, position.y, position.x - 15, position.y);
    graphics.lineBetween(position.x + 15, position.y, position.x + 34, position.y);
    graphics.lineBetween(position.x, position.y - 34, position.x, position.y - 15);
    graphics.lineBetween(position.x, position.y + 15, position.x, position.y + 34);
}

function drawImpactChoices(graphics, layout, simulation) {
    graphics.clear();
    if (simulation.phase !== 'classifying' && simulation.phase !== 'complete') return;
    const field = layout.field;
    const positions = [0.22, 0.5, 0.78];
    positions.forEach((ratio, index) => {
        const x = field.x + field.width * ratio;
        const y = field.y + field.height * 0.26;
        const selected = index === Math.round(simulation.selectedImpact);
        graphics.fillStyle(selected ? 0xf4c85f : 0x6f716d, selected ? 0.95 : 0.72);
        graphics.fillCircle(x, y, selected ? 18 : 12);
        graphics.lineStyle(selected ? 4 : 2, 0x292d38, 1);
        graphics.strokeCircle(x, y, selected ? 24 : 17);
        graphics.lineStyle(2, selected ? 0xd5634d : 0x595b58, 0.65);
        graphics.strokeCircle(x, y, selected ? 41 : 28);
    });
}

function instructionFor(simulation, language) {
    const pt = language !== 'en';
    if (simulation.phase === 'placing') {
        const remaining = SEISMIC_LIMITS.sensorTotal - simulation.sensors.length;
        return pt ? `Move o alvo e coloca ${remaining} ${remaining === 1 ? 'sensor' : 'sensores'}.`
            : `Move the target and place ${remaining} ${remaining === 1 ? 'sensor' : 'sensors'}.`;
    }
    if (simulation.phase === 'aligning') return pt
        ? 'Esquerda/direita: sobrepõe os 3 pulsos. Depois confirma.'
        : 'Left/right: overlap all 3 pulses. Then confirm.';
    if (simulation.phase === 'classifying') return pt
        ? 'Qual impacto explica as 3 leituras? Escolhe e confirma.'
        : 'Which impact explains all 3 readings? Choose and confirm.';
    return pt ? 'Conseguimos ouvir a Lua!' : 'We listened to the Moon!';
}

/**
 * @param {{ parent: HTMLElement, language?: string, profile?: object, onReady?: () => void, onTelemetry?: (value: object) => void, onEvent?: (event: string) => void }} options
 */
export async function createSeismicGame({
    parent,
    language = 'pt',
    profile = {},
    onReady = () => {},
    onTelemetry = () => {},
    onEvent = () => {}
}) {
    const phaserModule = await import('phaser');
    const Phaser = /** @type {any} */ (phaserModule.default ?? phaserModule);
    const actions = createSeismicInputState();
    let timeScale = 1;
    let layout = createSeismicLayout(parent.clientWidth || 960, parent.clientHeight || 540);
    let resolveReady;
    const ready = new Promise((resolve) => { resolveReady = resolve; });
    const sceneKey = profile.id ?? 'moon-seismology';

    class SeismicScene extends Phaser.Scene {
        constructor() {
            super(sceneKey);
            this.simulation = createSeismicState(profile.initialState);
            this.telemetryElapsed = 0;
            this.completedEmitted = false;
        }

        init(data = {}) {
            if (data.simulation) this.simulation = createSeismicState(data.simulation);
        }

        create() {
            drawPaperBackdrop(this, layout);
            this.heading = createTitle(this, layout, language);
            drawConsole(this, layout);
            this.strips = createSignalStrips(this, layout);
            this.sensorViews = [0, 1, 2].map((index) => createSensor(this, index).setVisible(false));
            this.cursor = this.add.graphics();
            this.impacts = this.add.graphics();
            this.keys = this.input.keyboard?.addKeys({
                w: 'W', a: 'A', s: 'S', d: 'D',
                arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT',
                activate: 'SPACE'
            }) ?? {};
            onTelemetry(getSeismicTelemetry(this.simulation));
            onReady();
            resolveReady();
        }

        update(time, deltaMilliseconds) {
            const touch = readSeismicInput(actions);
            const keyboard = readSeismicKeyboardInput(this.keys);
            const input = {
                horizontal: Math.max(-1, Math.min(1, touch.horizontal + keyboard.horizontal)),
                vertical: Math.max(-1, Math.min(1, touch.vertical + keyboard.vertical)),
                activate: touch.activate || keyboard.activate
            };
            this.simulation = stepSeismic(this.simulation, input, (deltaMilliseconds / 1000) * timeScale);
            const cursorPosition = mapSeismicPosition(this.simulation.cursor, layout);
            const cursorValid = !this.simulation.sensors.some((sensor) => (
                Math.hypot(sensor.x - this.simulation.cursor.x, sensor.y - this.simulation.cursor.y)
                    < SEISMIC_LIMITS.minimumSensorDistance
            ));
            drawCursor(this.cursor, cursorPosition, cursorValid);
            this.cursor.setVisible(this.simulation.phase === 'placing');
            this.sensorViews.forEach((view, index) => {
                const sensor = this.simulation.sensors[index];
                view.setVisible(Boolean(sensor));
                if (sensor) {
                    const position = mapSeismicPosition(sensor, layout);
                    view.setPosition(position.x, position.y);
                }
            });
            this.strips.forEach((strip, index) => drawSignalStrip(
                strip, layout.console, index, this.simulation, time
            ));
            drawImpactChoices(this.impacts, layout, this.simulation);
            this.heading.instruction.setText(instructionFor(this.simulation, language));
            this.telemetryElapsed += deltaMilliseconds;
            if (this.telemetryElapsed >= 90 || this.simulation.event) {
                this.telemetryElapsed = 0;
                onTelemetry(getSeismicTelemetry(this.simulation));
            }
            if (this.simulation.event && this.simulation.event !== 'seismic-solved') {
                onEvent(this.simulation.event);
            }
            if (this.simulation.event === 'seismic-solved' && !this.completedEmitted) {
                this.completedEmitted = true;
                onEvent('seismic-solved');
            }
        }
    }

    const game = new Phaser.Game({
        type: Phaser.CANVAS,
        parent,
        width: layout.width,
        height: layout.height,
        backgroundColor: '#0b132b',
        antialias: true,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: layout.width, height: layout.height },
        scene: [SeismicScene],
        banner: false
    });
    await ready;
    const resizeObserver = typeof globalThis.ResizeObserver === 'function'
        ? new globalThis.ResizeObserver(() => {
            const nextLayout = createSeismicLayout(parent.clientWidth || 960, parent.clientHeight || 540);
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
        setAction: (action, active) => setSeismicAction(actions, action, active),
        setTimeScale: (value) => { timeScale = Math.max(0.4, Math.min(1, Number(value) || 1)); },
        getState() {
            const scene = game.scene.getScene(sceneKey);
            return scene?.simulation ? structuredClone(scene.simulation) : null;
        },
        advanceTime(milliseconds) {
            const scene = game.scene.getScene(sceneKey);
            if (!scene?.simulation) return;
            const frameMilliseconds = 1000 / 60;
            const steps = Math.max(1, Math.round(milliseconds / frameMilliseconds));
            for (let index = 0; index < steps; index += 1) scene.update(index * frameMilliseconds, frameMilliseconds);
        },
        destroy() {
            resizeObserver.disconnect();
            game.destroy(true);
        }
    });
}
