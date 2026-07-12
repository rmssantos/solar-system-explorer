# Paper soundscape assets

The current MP3 files were generated specifically for Paper Solar Explorer with ElevenLabs Sound Effects (`eleven_text_to_sound_v2`) on 2026-07-12. Their prompts, durations and loop settings live in `scripts/generate-paper-audio.mjs`.

`node scripts/generate-paper-audio-fallback.mjs` remains available only as an offline deterministic fallback. It must not overwrite the committed ElevenLabs assets during normal development.

Regenerate missing files from the repository root with:

```powershell
node scripts/generate-paper-audio.mjs
```

The script reads `ELEVENLABS_API_KEY` or the existing `ELEVEN_LABS` value from an ignored `.env`. It never embeds the key in browser assets. Existing audio is skipped unless `--force` is supplied, preventing accidental repeated API spend.
