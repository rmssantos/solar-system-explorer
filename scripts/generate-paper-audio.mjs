import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_URL = 'https://api.elevenlabs.io/v1/sound-generation';
const REQUEST_TIMEOUT_MS = 90_000;
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(projectRoot, 'paper-preview', 'public', 'audio');
const force = process.argv.includes('--force');

const cues = [
    {
        filename: 'cosmic-ambience.mp3',
        duration_seconds: 30,
        loop: true,
        text: 'Seamless calm deep-space ambience for a handcrafted paper solar-system exploration game. Warm airy synth drone, very sparse glass harmonics, faint tactile paper fibres and distant observatory radio texture. Gentle, curious, child-friendly, no melody, no beat, no voices, no impacts, no dramatic rise, perfectly even loop.'
    },
    {
        filename: 'paper-engine.mp3',
        duration_seconds: 12,
        loop: true,
        text: 'Seamless soft propulsion engine loop for a tiny handcrafted paper spacecraft. Warm low electric hum, airy thrust, subtle cardboard resonance, stable and smooth. Calm science-exploration mood, no alarms, no impacts, no melody, no voices, no obvious beginning or ending.'
    },
    {
        filename: 'paper-fold.mp3',
        duration_seconds: 1.6,
        loop: false,
        text: 'A single gentle field-notebook page unfolding with thick textured paper and a tiny wooden desk tap. Warm, tactile, clean, close microphone, no voice, no background ambience.'
    },
    {
        filename: 'autopilot-start.mp3',
        duration_seconds: 2.2,
        loop: false,
        text: 'A short friendly navigation activation signal for a paper spacecraft: two soft ascending observatory-radio tones, light airy whoosh and subtle paper flutter. Curious and calm, not futuristic combat, no voice.'
    },
    {
        filename: 'autopilot-arrive.mp3',
        duration_seconds: 2.8,
        loop: false,
        text: 'A gentle spacecraft arrival resolve: warm glassy three-note chime, soft decelerating air, tiny paper sail settling. Reassuring discovery moment for children, quiet and elegant, no voice, no fanfare.'
    },
    {
        filename: 'quiz-correct.mp3',
        duration_seconds: 1.8,
        loop: false,
        text: 'A soft correct-answer cue made from two bright wooden glockenspiel notes and a delicate paper sparkle. Warm, educational and rewarding, restrained volume, no voice, no arcade sound.'
    },
    {
        filename: 'quiz-wrong.mp3',
        duration_seconds: 1.2,
        loop: false,
        text: 'A gentle try-again cue: one muted wooden knock followed by a tiny soft downward paper tone. Kind and non-punitive, no buzzer, no alarm, no voice.'
    },
    {
        filename: 'reward-chime.mp3',
        duration_seconds: 3.2,
        loop: false,
        text: 'A compact handcrafted explorer reward flourish: warm glass harmonics, three rising marimba notes, soft paper confetti rustle, satisfying but calm. No drums, no cinematic boom, no voice.'
    },
    {
        filename: 'lumi-signal.mp3',
        duration_seconds: 2.4,
        loop: false,
        text: 'A friendly incoming observatory transmission signal: a faint radio sweep, two twinkling star tones and a light paper antenna flutter. Mysterious but safe and calm, no speech, no alarm.'
    },
    {
        filename: 'cargo-capture.mp3',
        duration_seconds: 1.5,
        loop: false,
        text: 'A tiny orbital cargo capture cue: soft magnetic click, short cardboard latch, one warm marimba note and a faint paper flag flutter. Satisfying, tactile, child-friendly, no voice, no arcade coin sound.'
    },
    {
        filename: 'shield-impact.mp3',
        duration_seconds: 1.2,
        loop: false,
        text: 'A gentle debris deflection against a handcrafted paper spacecraft shield: muted padded tap, brief cardboard wobble and soft low wooden tone. Safe and non-scary for children, no explosion, no alarm, no voice.'
    },
    {
        filename: 'soft-impact.mp3',
        duration_seconds: 1.1,
        loop: false,
        text: 'A soft spacecraft docking bump: cushioned wooden knock, tiny folded-paper creak, kind try-again feeling. Quiet, non-punitive and child-friendly, no alarm, no crash, no voice.'
    },
    {
        filename: 'docking-clamp.mp3',
        duration_seconds: 2,
        loop: false,
        text: 'Successful gentle orbital docking: two precise mechanical paper-card latches, a quiet airtight settle and one warm glass note. Reassuring handcrafted science game feedback, no voice, no fanfare.'
    },
    {
        filename: 'signal-lock.mp3',
        duration_seconds: 2.2,
        loop: false,
        text: 'A Mars radio signal reaching perfect lock: clean observatory sweep narrowing into three warm clear tones with a faint antenna paper flutter. Curious and rewarding, no speech, no alarm, no arcade sound.'
    },
    {
        filename: 'slingshot-boost.mp3',
        duration_seconds: 2.4,
        loop: false,
        text: 'A paper spacecraft gaining speed from a planetary gravitational slingshot: smooth rising airy rush, warm cardboard resonance and a bright scientific confirmation tone. Exciting but calm, no engine roar, no voice.'
    },
    {
        filename: 'mission-celebration.mp3',
        duration_seconds: 3,
        loop: false,
        text: 'A concise handcrafted space mission celebration: four light wooden and glass notes, gentle paper confetti, warm resolved ending. Proud and joyful for children but restrained, no drums, no voice, no cinematic boom.'
    }
];

function parseEnvFile(path) {
    if (!existsSync(path)) return;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match || match[1].startsWith('#') || process.env[match[1]]) continue;
        const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
        process.env[match[1]] = value;
    }
}

function loadLocalEnvironment() {
    parseEnvFile(join(projectRoot, '.env'));
    try {
        const commonGitDir = execFileSync('git', ['rev-parse', '--git-common-dir'], {
            cwd: projectRoot,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore']
        }).trim();
        const absoluteGitDir = resolve(projectRoot, commonGitDir);
        parseEnvFile(join(dirname(absoluteGitDir), '.env'));
    } catch {
        // The script also works outside git when the environment is already set.
    }
}

async function generateCue(cue, apiKey) {
    const destination = join(outputDir, cue.filename);
    if (!force && existsSync(destination)) {
        console.log(`skip ${cue.filename}`);
        return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;
    try {
        response = await fetch(`${API_URL}?output_format=mp3_44100_128`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            signal: controller.signal,
            body: JSON.stringify({
                text: cue.text,
                duration_seconds: cue.duration_seconds,
                loop: cue.loop,
                prompt_influence: 0.45,
                model_id: 'eleven_text_to_sound_v2'
            })
        });
    } finally {
        clearTimeout(timeout);
    }
    if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        throw new Error(`ElevenLabs ${response.status} while generating ${cue.filename}: ${detail}`);
    }
    const temporary = `${destination}.tmp`;
    try {
        writeFileSync(temporary, Buffer.from(await response.arrayBuffer()));
        renameSync(temporary, destination);
    } finally {
        rmSync(temporary, { force: true });
    }
    console.log(`generated ${cue.filename}`);
}

loadLocalEnvironment();
const apiKey = process.env.ELEVENLABS_API_KEY ?? process.env.ELEVEN_LABS;
if (!apiKey) throw new Error('Set ELEVENLABS_API_KEY or ELEVEN_LABS in an ignored .env file.');
mkdirSync(outputDir, { recursive: true });
for (const cue of cues) await generateCue(cue, apiKey);
