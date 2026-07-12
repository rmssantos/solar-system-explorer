import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'paper-preview', 'public', 'audio');
const sampleRate = 44_100;
const twoPi = Math.PI * 2;
let seed = 0x51a7cafe;
let smoothNoise = 0;

function noise() {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return (seed / 0x7fffffff) - 1;
}

function filteredNoise(amount = 0.08) {
    smoothNoise += (noise() - smoothNoise) * amount;
    return smoothNoise;
}

function pulse(t, start, duration) {
    const x = (t - start) / duration;
    return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2;
}

function bell(t, start, frequency, decay = 3.2) {
    const age = t - start;
    if (age < 0) return 0;
    return Math.sin(twoPi * frequency * age) * Math.exp(-age * decay);
}

const designs = [
    ['cosmic-ambience.mp3', 30, (t) => {
        const edge = Math.min(1, t / 1.5, (30 - t) / 1.5);
        const drone = Math.sin(twoPi * 55 * t) * 0.16 + Math.sin(twoPi * 82 * t) * 0.08 + Math.sin(twoPi * 137 * t) * 0.035;
        const stars = bell(t, 5, 523.25, 1.5) + bell(t, 12, 659.25, 1.7) + bell(t, 20, 783.99, 1.6) + bell(t, 26, 587.33, 1.8);
        return edge * ((drone * 0.42) + (stars * 0.025) + (filteredNoise(0.004) * 0.035));
    }],
    ['paper-engine.mp3', 12, (t) => {
        const edge = Math.min(1, t / .5, (12 - t) / .5);
        return edge * ((Math.sin(twoPi * 72 * t) * 0.075) + (Math.sin(twoPi * 108 * t) * 0.025) + (filteredNoise(0.025) * 0.12));
    }],
    ['paper-fold.mp3', 1.6, (t) => (filteredNoise(0.22) * pulse(t, .05, 1.2) * .3) + (bell(t, .82, 145, 12) * .16)],
    ['autopilot-start.mp3', 2.2, (t) => (bell(t, .18, 392, 3.5) + bell(t, .72, 587.33, 3.2)) * .16 + filteredNoise(0.06) * pulse(t, .15, 1.6) * .08],
    ['autopilot-arrive.mp3', 2.8, (t) => (bell(t, .18, 523.25) + bell(t, .62, 659.25) + bell(t, 1.08, 783.99)) * .13 + filteredNoise(0.04) * pulse(t, 0, 1.7) * .045],
    ['quiz-correct.mp3', 1.8, (t) => (bell(t, .12, 659.25, 4.5) + bell(t, .48, 880, 4.3)) * .18],
    ['quiz-wrong.mp3', 1.2, (t) => (bell(t, .08, 170, 9) * .18) + (bell(t, .34, 130, 7) * .09)],
    ['reward-chime.mp3', 3.2, (t) => (bell(t, .08, 392) + bell(t, .42, 523.25) + bell(t, .78, 659.25) + bell(t, 1.16, 783.99)) * .14 + filteredNoise(0.18) * pulse(t, .75, 1.5) * .055],
    ['lumi-signal.mp3', 2.4, (t) => (bell(t, .2, 740, 4) + bell(t, .65, 988, 3.8)) * .11 + Math.sin(twoPi * (250 + t * 140) * t) * pulse(t, 0, 1.35) * .04]
];

function writeWav(path, duration, sampleAt) {
    smoothNoise = 0;
    const sampleCount = Math.floor(duration * sampleRate);
    const dataSize = sampleCount * 2;
    const buffer = Buffer.alloc(44 + dataSize);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVEfmt ', 8);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    for (let index = 0; index < sampleCount; index += 1) {
        const sample = Math.max(-1, Math.min(1, sampleAt(index / sampleRate)));
        buffer.writeInt16LE(Math.round(sample * 32767), 44 + (index * 2));
    }
    writeFileSync(path, buffer);
}

mkdirSync(outputDir, { recursive: true });
for (const [filename, duration, sampleAt] of designs) {
    const wav = join(outputDir, `${filename}.wav`);
    const mp3 = join(outputDir, filename);
    writeWav(wav, duration, sampleAt);
    execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '128k', mp3]);
    rmSync(wav, { force: true });
    console.log(`generated local fallback ${filename}`);
}
