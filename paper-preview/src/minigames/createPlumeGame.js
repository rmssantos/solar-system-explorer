import {
  createPlumeState,
  getPlumeTelemetry,
  stepPlume,
} from "./plumeSimulation.js";

const ACTIONS = Object.freeze([
  "forward",
  "reverse",
  "up",
  "down",
  "stabilize",
]);
export function createPlumeLayout(width = 960, height = 540) {
  const portrait = height > width * 1.08;
  return Object.freeze({
    orientation: portrait ? "portrait" : "landscape",
    width: portrait ? 540 : 960,
    height: portrait ? 960 : 540,
    field: Object.freeze(
      portrait
        ? { x: 44, y: 225, width: 452, height: 285 }
        : { x: 48, y: 90, width: 650, height: 394 },
    ),
    console: Object.freeze(
      portrait
        ? { x: 44, y: 520, width: 452, height: 105 }
        : { x: 720, y: 90, width: 192, height: 394 },
    ),
  });
}
export function createPlumeInputState() {
  return Object.fromEntries(ACTIONS.map((action) => [action, false]));
}
export function setPlumeAction(state, action, active) {
  if (!(action in state)) return false;
  state[action] = Boolean(active);
  return true;
}
export function readPlumeInput(state) {
  return {
    horizontal: +Boolean(state.forward) - +Boolean(state.reverse),
    vertical: +Boolean(state.up) - +Boolean(state.down),
    collector: Boolean(state.stabilize),
  };
}
const down = (key) => Boolean(key?.isDown);
export function readPlumeKeyboardInput(keys = {}) {
  return {
    horizontal:
      +(down(keys.d) || down(keys.arrowRight)) -
      +(down(keys.a) || down(keys.arrowLeft)),
    vertical:
      +(down(keys.w) || down(keys.arrowUp)) -
      +(down(keys.s) || down(keys.arrowDown)),
    collector: down(keys.collector),
  };
}
export function mapPlumePosition(position, layout = createPlumeLayout()) {
  const f = layout.field;
  return Object.freeze({
    x: f.x + 40 + ((position.x + 1) / 2) * (f.width - 80),
    y: f.y + 42 + ((position.y + 1) / 2) * (f.height - 96),
  });
}

function backdrop(scene, layout) {
  const g = scene.add.graphics();
  g.fillStyle(0x071326, 1).fillRect(0, 0, layout.width, layout.height);
  for (let i = 0; i < 60; i += 1)
    g.fillStyle(i % 8 ? 0xfff7e7 : 0x8ed5e0, 0.2 + (i % 3) * 0.16).fillCircle(
      (i * 149 + 17) % layout.width,
      (i * 71 + 13) % layout.height,
      i % 11 ? 1 : 2,
    );
}
function flightField(scene, layout) {
  const f = layout.field;
  const g = scene.add.graphics();
  g.fillStyle(0x020814, 0.5).fillRoundedRect(
    f.x + 8,
    f.y + 10,
    f.width,
    f.height,
    18,
  );
  g.fillStyle(0xbedde1, 1).fillRoundedRect(f.x, f.y, f.width, f.height, 18);
  g.fillStyle(0xeaf6f3, 1).fillRect(
    f.x + 4,
    f.y + f.height * 0.78,
    f.width - 8,
    f.height * 0.18,
  );
  g.lineStyle(6, 0x293344, 1).strokeRoundedRect(
    f.x,
    f.y,
    f.width,
    f.height,
    18,
  );
  for (let i = 0; i < 9; i += 1) {
    const x = f.x + 25 + (i * (f.width - 50)) / 8;
    g.lineStyle(9 + (i % 3) * 4, 0xf7ffff, 0.32).lineBetween(
      x,
      f.y + f.height - 35,
      x + (i % 2 ? 44 : -28),
      f.y + 35,
    );
  }
  g.lineStyle(4, 0x4e7f88, 0.8);
  g.beginPath()
    .moveTo(f.x + 5, f.y + f.height * 0.82)
    .lineTo(f.x + f.width * 0.25, f.y + f.height * 0.75)
    .lineTo(f.x + f.width * 0.5, f.y + f.height * 0.84)
    .lineTo(f.x + f.width * 0.75, f.y + f.height * 0.76)
    .lineTo(f.x + f.width - 5, f.y + f.height * 0.82)
    .strokePath();
}
function heading(scene, layout, language) {
  const pt = language !== "en",
    y = layout.orientation === "portrait" ? 145 : 23;
  scene.add
    .text(
      layout.width / 2,
      y,
      pt ? "PISTA 3 · VOA PELA PLUMA" : "CLUE 3 · FLY THROUGH THE PLUME",
      {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#f4c85f",
        letterSpacing: 2,
      },
    )
    .setOrigin(0.5, 0);
  return scene.add
    .text(
      layout.width / 2,
      y + 26,
      pt
        ? "Apanha 5 cristais pequenos. Fecha o coletor junto aos blocos."
        : "Catch 5 small crystals. Close the collector near chunks.",
      {
        fontFamily: "Arial",
        fontSize: layout.orientation === "portrait" ? "21px" : "19px",
        fontStyle: "bold",
        color: "#fff7e7",
        align: "center",
        wordWrap: { width: layout.width - 65 },
      },
    )
    .setOrigin(0.5, 0);
}
function makeCraft(scene) {
  const craft = scene.add.container();
  const g = scene.add.graphics();
  g.fillStyle(0x111827, 0.4).fillTriangle(-34, 17, 38, 17, 0, -30);
  g.fillStyle(0xffedbd, 1).fillTriangle(-31, 13, 31, 13, 0, -29);
  g.fillStyle(0xd5634d, 1).fillRect(-33, 3, 66, 9);
  g.fillStyle(0x4d8490, 1).fillCircle(0, -1, 11);
  g.lineStyle(4, 0x293344, 1).strokeTriangle(-31, 13, 31, 13, 0, -29);
  const collector = scene.add.graphics();
  collector.lineStyle(4, 0xf4c85f, 1).strokeCircle(0, 25, 14);
  collector.lineBetween(-14, 25, -5, 12);
  collector.lineBetween(14, 25, 5, 12);
  craft.add([g, collector]);
  craft.collector = collector;
  return craft;
}
function makeGrain(scene, grain) {
  const g = scene.add.graphics();
  const large = grain.size === "large";
  g.fillStyle(large ? 0x5a7680 : 0xffffff, 1).fillCircle(0, 0, large ? 18 : 8);
  g.lineStyle(large ? 4 : 2, 0x293344, 1).strokeCircle(0, 0, large ? 18 : 8);
  if (!large) g.fillStyle(0x9fdbe0, 1).fillCircle(-2, -2, 3);
  return g;
}
function consolePanel(scene, layout, language) {
  const c = layout.console,
    pt = language !== "en";
  const g = scene.add.graphics();
  g.fillStyle(0x020814, 0.5).fillRoundedRect(
    c.x + 7,
    c.y + 8,
    c.width,
    c.height,
    16,
  );
  g.fillStyle(0xfff3cf, 1).fillRoundedRect(c.x, c.y, c.width, c.height, 16);
  g.lineStyle(5, 0x9d7942, 1).strokeRoundedRect(
    c.x,
    c.y,
    c.width,
    c.height,
    16,
  );
  const text = scene.add.text(c.x + 20, c.y + 22, "", {
    fontFamily: "Arial",
    fontSize: layout.orientation === "portrait" ? "16px" : "15px",
    fontStyle: "bold",
    color: "#293344",
    lineSpacing: 13,
    wordWrap: { width: c.width - 40 },
  });
  text.label = pt
    ? ["CRISTAIS", "PUREZA", "FRIO"]
    : ["CRYSTALS", "PURITY", "COLD"];
  return text;
}

/** @param {{parent: HTMLElement, language?: string, profile?: any, onReady?: () => void, onTelemetry?: (value: object) => void, onEvent?: (event: string) => void}} options */
export async function createPlumeGame({
  parent,
  language = "pt",
  profile = {},
  onReady = () => {},
  onTelemetry = () => {},
  onEvent = () => {},
}) {
  const module = await import("phaser");
  const Phaser = module.default ?? module;
  const actions = createPlumeInputState();
  let timeScale = 1;
  let layout = createPlumeLayout(
      parent.clientWidth || 960,
      parent.clientHeight || 540,
    ),
    resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });
  const sceneKey = profile.id ?? "enceladus-plume";
  class PlumeScene extends Phaser.Scene {
    constructor() {
      super(sceneKey);
      this.simulation = createPlumeState(profile.initialState);
      this.telemetryElapsed = 0;
      this.lastEvent = null;
    }
    init(data = {}) {
      if (data.simulation) this.simulation = createPlumeState(data.simulation);
    }
    create() {
      backdrop(this, layout);
      flightField(this, layout);
      heading(this, layout, language);
      this.status = consolePanel(this, layout, language);
      this.grainViews = this.simulation.grains.map((grain) =>
        makeGrain(this, grain),
      );
      this.craft = makeCraft(this);
      this.keys =
        this.input.keyboard?.addKeys({
          w: "W",
          a: "A",
          s: "S",
          d: "D",
          arrowUp: "UP",
          arrowDown: "DOWN",
          arrowLeft: "LEFT",
          arrowRight: "RIGHT",
          collector: "SPACE",
        }) ?? {};
      onTelemetry(getPlumeTelemetry(this.simulation));
      onReady();
      resolveReady();
    }
    update(time, deltaMs) {
      const touch = readPlumeInput(actions),
        keyboard = readPlumeKeyboardInput(this.keys);
      this.simulation = stepPlume(
        this.simulation,
        {
          horizontal: Math.max(
            -1,
            Math.min(1, touch.horizontal + keyboard.horizontal),
          ),
          vertical: Math.max(
            -1,
            Math.min(1, touch.vertical + keyboard.vertical),
          ),
          collector: touch.collector || keyboard.collector,
        },
        (deltaMs / 1000) * timeScale,
      );
      const p = mapPlumePosition(this.simulation.position, layout);
      this.craft.setPosition(p.x, p.y);
      this.craft.collector.setAlpha(this.simulation.collector ? 1 : 0.24);
      this.craft.setRotation(Math.sin(time / 300) * 0.018);
      this.grainViews.forEach((view, index) => {
        const grain = this.simulation.grains[index];
        const gp = mapPlumePosition(grain, layout);
        view.setPosition(gp.x, gp.y).setVisible(!grain.collected);
      });
      const t = getPlumeTelemetry(this.simulation);
      this.status.setText(
        `${this.status.label[0]}  ${t.samples}/${t.total}\n${this.status.label[1]}  ${Math.round(t.purity * 100)}%\n${this.status.label[2]}  ${Math.round(t.cooling * 100)}%`,
      );
      this.telemetryElapsed += deltaMs;
      if (this.telemetryElapsed >= 90 || this.simulation.event) {
        this.telemetryElapsed = 0;
        onTelemetry(t);
      }
      if (this.simulation.event && this.simulation.event !== this.lastEvent) {
        this.lastEvent = this.simulation.event;
        onEvent(this.simulation.event);
      }
      if (!this.simulation.event) this.lastEvent = null;
    }
  }
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: layout.width,
    height: layout.height,
    backgroundColor: "#071326",
    antialias: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: layout.width,
      height: layout.height,
    },
    scene: [PlumeScene],
    banner: false,
  });
  await ready;
  const observer =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(() => {
          const next = createPlumeLayout(
            parent.clientWidth || 960,
            parent.clientHeight || 540,
          );
          if (next.orientation === layout.orientation)
            return game.scale.refresh();
          const scene = game.scene.getScene(sceneKey),
            simulation = scene?.simulation;
          layout = next;
          game.scale.resize(layout.width, layout.height);
          scene?.scene.restart({ simulation });
        })
      : { observe(_element) {}, disconnect() {} };
  observer.observe(parent);
  return Object.freeze({
    setAction: (action, active) => setPlumeAction(actions, action, active),
    setTimeScale: (value) => {
      timeScale = Math.max(0.4, Math.min(1, Number(value) || 1));
    },
    getState: () => {
      const state = game.scene.getScene(sceneKey)?.simulation;
      return state ? structuredClone(state) : null;
    },
    advanceTime(milliseconds) {
      const scene = game.scene.getScene(sceneKey),
        frame = 1000 / 60;
      for (
        let i = 0;
        scene?.simulation && i < Math.max(1, Math.round(milliseconds / frame));
        i += 1
      )
        scene.update(i * frame, frame);
    },
    destroy() {
      observer.disconnect();
      game.destroy(true);
    },
  });
}
