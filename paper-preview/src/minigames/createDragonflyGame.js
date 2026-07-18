import {
  DRAGONFLY_SITES,
  createDragonflyState,
  getDragonflyTelemetry,
  stepDragonfly,
} from "./dragonflySimulation.js";

const ACTIONS = Object.freeze([
  "forward",
  "reverse",
  "up",
  "down",
  "stabilize",
]);
export function createDragonflyLayout(width = 960, height = 540) {
  const portrait = height > width * 1.08;
  return Object.freeze({
    orientation: portrait ? "portrait" : "landscape",
    width: portrait ? 540 : 960,
    height: portrait ? 960 : 540,
    field: Object.freeze(
      portrait
        ? { x: 42, y: 225, width: 456, height: 285 }
        : { x: 48, y: 92, width: 650, height: 390 },
    ),
    console: Object.freeze(
      portrait
        ? { x: 42, y: 520, width: 456, height: 105 }
        : { x: 718, y: 92, width: 194, height: 390 },
    ),
  });
}
export function createDragonflyInputState() {
  return Object.fromEntries(ACTIONS.map((action) => [action, false]));
}
export function setDragonflyAction(state, action, active) {
  if (!(action in state)) return false;
  state[action] = Boolean(active);
  return true;
}
export function readDragonflyInput(state) {
  return {
    horizontal: +Boolean(state.forward) - +Boolean(state.reverse),
    vertical: +Boolean(state.up) - +Boolean(state.down),
    action: Boolean(state.stabilize),
  };
}
const keyDown = (key) => Boolean(key?.isDown);
export function readDragonflyKeyboardInput(keys = {}) {
  return {
    horizontal:
      +(keyDown(keys.d) || keyDown(keys.right)) -
      +(keyDown(keys.a) || keyDown(keys.left)),
    vertical:
      +(keyDown(keys.w) || keyDown(keys.up)) -
      +(keyDown(keys.s) || keyDown(keys.down)),
    action: keyDown(keys.action),
  };
}
export function mapDragonflyPosition(state, layout = createDragonflyLayout()) {
  const f = layout.field;
  return Object.freeze({
    x: f.x + 42 + state.routeProgress * (f.width - 84),
    y: f.y + f.height - 62 - state.altitude * (f.height - 125),
  });
}

function drawWorld(scene, layout) {
  const g = scene.add.graphics(),
    f = layout.field;
  g.fillStyle(0x071128, 1).fillRect(0, 0, layout.width, layout.height);
  for (let i = 0; i < 55; i += 1)
    g.fillStyle(i % 7 ? 0xfff4dd : 0x8fd4dd, 0.18 + (i % 4) * 0.13).fillCircle(
      (i * 163 + 13) % layout.width,
      (i * 79 + 9) % layout.height,
      i % 12 ? 1 : 2,
    );
  g.fillStyle(0x030817, 0.5).fillRoundedRect(
    f.x + 8,
    f.y + 10,
    f.width,
    f.height,
    18,
  );
  g.fillStyle(0x688b91, 1).fillRoundedRect(f.x, f.y, f.width, f.height, 18);
  g.fillStyle(0x263e52, 0.55).fillRect(
    f.x + 4,
    f.y + 4,
    f.width - 8,
    f.height * 0.42,
  );
  g.fillStyle(0xd56b50, 1);
  g.beginPath().moveTo(f.x + 4, f.y + f.height - 60);
  for (let i = 0; i <= 10; i += 1)
    g.lineTo(
      f.x + (i * (f.width - 8)) / 10,
      f.y + f.height - 72 - (i % 2) * 28,
    );
  g.lineTo(f.x + f.width - 4, f.y + f.height - 4)
    .lineTo(f.x + 4, f.y + f.height - 4)
    .closePath()
    .fillPath();
  g.fillStyle(0x245e6a, 1).fillEllipse(
    f.x + f.width * 0.82,
    f.y + f.height * 0.82,
    f.width * 0.24,
    42,
  );
  g.lineStyle(6, 0x293244, 1).strokeRoundedRect(
    f.x,
    f.y,
    f.width,
    f.height,
    18,
  );
  DRAGONFLY_SITES.forEach((site, i) => {
    const p = mapDragonflyPosition(
      { routeProgress: site.routeProgress, altitude: 0.18 },
      layout,
    );
    g.fillStyle(i ? 0x4d8490 : 0xf4c85f, 1).fillTriangle(
      p.x - 14,
      p.y,
      p.x + 14,
      p.y,
      p.x,
      p.y - 32,
    );
    g.lineStyle(3, 0x293244, 1).strokeTriangle(
      p.x - 14,
      p.y,
      p.x + 14,
      p.y,
      p.x,
      p.y - 32,
    );
  });
}
function drawHeading(scene, layout, language) {
  const pt = language !== "en",
    y = layout.orientation === "portrait" ? 145 : 23;
  scene.add
    .text(
      layout.width / 2,
      y,
      pt ? "PISTA 4 · LIBÉLULA DE PAPEL" : "CLUE 4 · PAPER DRAGONFLY",
      {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#f4c85f",
        letterSpacing: 2,
      },
    )
    .setOrigin(0.5, 0);
  scene.add
    .text(
      layout.width / 2,
      y + 27,
      pt
        ? "Segue as bandeiras, equilibra o vento e ANALISA os 2 locais."
        : "Follow flags, balance the wind and ANALYSE both sites.",
      {
        fontFamily: "Arial",
        fontSize: layout.orientation === "portrait" ? "21px" : "19px",
        fontStyle: "bold",
        color: "#fff4dd",
        align: "center",
        wordWrap: { width: layout.width - 65 },
      },
    )
    .setOrigin(0.5, 0);
}
function makeDragonfly(scene) {
  const craft = scene.add.container();
  const g = scene.add.graphics();
  g.fillStyle(0x101728, 0.4).fillEllipse(3, 5, 96, 30);
  g.fillStyle(0xffeabd, 1).fillRoundedRect(-28, -9, 56, 28, 7);
  g.fillStyle(0xd5634d, 1).fillCircle(0, 0, 13);
  g.fillStyle(0x4d8490, 1)
    .fillEllipse(-35, -8, 42, 13)
    .fillEllipse(35, -8, 42, 13);
  g.lineStyle(4, 0x293244, 1).strokeRoundedRect(-28, -9, 56, 28, 7);
  [-32, -12, 12, 32].forEach((x) => {
    g.lineBetween(x, -10, x, -25);
    g.fillCircle(x, -26, 5);
  });
  craft.add(g);
  return craft;
}
function makePanel(scene, layout, language) {
  const c = layout.console,
    pt = language !== "en",
    g = scene.add.graphics();
  g.fillStyle(0x020817, 0.5).fillRoundedRect(
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
    fontSize: layout.orientation === "portrait" ? "16px" : "14px",
    fontStyle: "bold",
    color: "#293244",
    lineSpacing: 13,
    wordWrap: { width: c.width - 40 },
  });
  text.labels = pt
    ? ["ROTA", "EQUILÍBRIO", "LOCAIS"]
    : ["ROUTE", "BALANCE", "SITES"];
  return text;
}

/** @param {{parent: HTMLElement, language?: string, profile?: any, onReady?: () => void, onTelemetry?: (value: object) => void, onEvent?: (event: string) => void}} options */
export async function createDragonflyGame({
  parent,
  language = "pt",
  profile = {},
  onReady = () => {},
  onTelemetry = () => {},
  onEvent = () => {},
}) {
  const module = await import("phaser"),
    Phaser = module.default ?? module,
    actions = createDragonflyInputState();
  let timeScale = 1;
  let layout = createDragonflyLayout(
      parent.clientWidth || 960,
      parent.clientHeight || 540,
    ),
    resolveReady;
  const ready = new Promise((resolve) => {
      resolveReady = resolve;
    }),
    sceneKey = profile.id ?? "titan-dragonfly";
  class DragonflyScene extends Phaser.Scene {
    constructor() {
      super(sceneKey);
      this.simulation = createDragonflyState(profile.initialState);
      this.elapsed = 0;
      this.lastEvent = null;
    }
    init(data = {}) {
      if (data.simulation)
        this.simulation = createDragonflyState(data.simulation);
    }
    create() {
      drawWorld(this, layout);
      drawHeading(this, layout, language);
      this.panel = makePanel(this, layout, language);
      this.craft = makeDragonfly(this);
      this.keys =
        this.input.keyboard?.addKeys({
          w: "W",
          a: "A",
          s: "S",
          d: "D",
          up: "UP",
          down: "DOWN",
          left: "LEFT",
          right: "RIGHT",
          action: "SPACE",
        }) ?? {};
      onTelemetry(getDragonflyTelemetry(this.simulation));
      onReady();
      resolveReady();
    }
    update(time, deltaMs) {
      const touch = readDragonflyInput(actions),
        keyboard = readDragonflyKeyboardInput(this.keys);
      this.simulation = stepDragonfly(
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
          action: touch.action || keyboard.action,
        },
        (deltaMs / 1000) * timeScale,
      );
      const p = mapDragonflyPosition(this.simulation, layout);
      this.craft
        .setPosition(p.x, p.y)
        .setRotation(
          this.simulation.wind * 0.07 + Math.sin(time / 170) * 0.015,
        );
      const t = getDragonflyTelemetry(this.simulation);
      this.panel.setText(
        `${this.panel.labels[0]}  ${Math.round(t.routeProgress * 100)}%\n${this.panel.labels[1]}  ${Math.round(t.stability * 100)}%\n${this.panel.labels[2]}  ${this.simulation.analysedSites.length}/2`,
      );
      this.elapsed += deltaMs;
      if (this.elapsed >= 90 || this.simulation.event) {
        this.elapsed = 0;
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
    backgroundColor: "#071128",
    antialias: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: layout.width,
      height: layout.height,
    },
    scene: [DragonflyScene],
    banner: false,
  });
  await ready;
  const observer =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(() => {
          const next = createDragonflyLayout(
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
    setAction: (action, active) => setDragonflyAction(actions, action, active),
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
