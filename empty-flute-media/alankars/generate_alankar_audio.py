import math
import struct
import wave
from pathlib import Path


OUT_DIR = Path("/Users/shashanksrinivas/Documents/Codex/genui/empty-flute-media/alankars")
SAMPLE_RATE = 44100
VOLUME = 0.34


NOTE_TO_MIDI = {
    "S": 60,
    "R": 62,
    "G": 64,
    "M": 65,
    "P": 67,
    "D": 69,
    "N": 71,
    "S'": 72,
}


ALANKAR_25 = [
    "S","S","R","S","S","R","S","R","S","S","R","R","G","G","M","M",
    "R","R","G","R","R","G","R","G","R","R","G","G","M","M","P","P",
    "G","G","M","G","G","M","G","M","G","G","M","M","P","P","D","D",
    "M","M","P","M","M","P","M","P","M","M","P","P","D","D","N","N",
    "P","P","D","P","P","D","P","D","P","P","D","D","N","N","S'","S'",
    "S'","S'","N","S'","S'","N","S'","N","S'","S'","N","N","D","D","P","P",
    "N","N","D","N","N","D","N","D","N","N","D","D","P","P","M","M",
    "D","D","P","D","D","P","D","P","D","D","P","P","M","M","G","G",
    "P","P","M","P","P","M","P","M","P","P","M","M","G","G","R","R",
    "M","M","G","M","M","G","M","G","M","M","G","G","R","R","S","S",
]


ALANKAR_26 = [
    "S","S","R","R","G","S","R","G","S","S","R","R","G","G","M","M",
    "R","R","G","G","M","R","G","M","R","R","G","G","M","M","P","P",
    "G","G","M","M","P","G","M","P","G","G","M","M","P","P","D","D",
    "M","M","P","P","D","M","P","D","M","M","P","P","D","D","N","N",
    "P","P","D","D","N","P","D","N","P","P","D","D","N","N","S'","S'",
    "S'","S'","N","N","D","S'","N","D","S'","S'","N","N","D","D","P","P",
    "N","N","D","D","P","N","D","P","N","N","D","D","P","P","M","M",
    "D","D","P","P","M","D","P","M","D","D","P","P","M","M","G","G",
    "P","P","M","M","G","P","M","G","P","P","M","M","G","G","R","R",
    "M","M","G","G","R","M","G","R","M","M","G","G","R","R","S","S",
]


ALANKAR_27 = [
    "S","S","R","R","G","G","M","M",
    "R","R","G","G","M","M","P","P",
    "G","G","M","M","P","P","D","D",
    "M","M","P","P","D","D","N","N",
    "P","P","D","D","N","N","S'","S'",
    "S'","S'","N","N","D","D","P","P",
    "N","N","D","D","P","P","M","M",
    "D","D","P","P","M","M","G","G",
    "P","P","M","M","G","G","R","R",
    "M","M","G","G","R","R","S","S",
]


def midi_to_freq(midi_note: int) -> float:
    return 440.0 * (2 ** ((midi_note - 69) / 12))


def lowpass(samples: list[float], cutoff_hz: float) -> list[float]:
    if not samples:
        return samples
    rc = 1.0 / (2.0 * math.pi * cutoff_hz)
    dt = 1.0 / SAMPLE_RATE
    alpha = dt / (rc + dt)
    out = []
    prev = samples[0]
    for sample in samples:
        prev = prev + alpha * (sample - prev)
        out.append(prev)
    return out


def synth_tone(freq: float, duration: float) -> list[float]:
    total = int(SAMPLE_RATE * duration)
    attack = int(total * 0.14)
    decay = int(total * 0.10)
    release = int(total * 0.22)
    sustain_end = max(attack, total - release)
    samples = []
    vibrato_rate = 5.0
    vibrato_depth = 0.0035
    phase1 = 0.0
    phase2 = 0.0
    phase3 = 0.0
    phase4 = 0.0
    phase_noise = 0.0

    for i in range(total):
        t = i / SAMPLE_RATE
        vibrato_in = max(0.0, (i - attack // 2) / max(1, total - attack))
        vib = 1.0 + (vibrato_depth * vibrato_in) * math.sin(2 * math.pi * vibrato_rate * t)
        glide = 1.012 - min(1.0, i / max(1, attack)) * 0.012
        current_freq = freq * vib * glide

        phase1 += 2 * math.pi * current_freq / SAMPLE_RATE
        phase2 += 2 * math.pi * current_freq * 2.01 / SAMPLE_RATE
        phase3 += 2 * math.pi * current_freq * 3.0 / SAMPLE_RATE
        phase4 += 2 * math.pi * current_freq * 4.05 / SAMPLE_RATE
        phase_noise += 2 * math.pi * 900 / SAMPLE_RATE

        tone = (
            0.74 * math.sin(phase1) +
            0.11 * math.sin(phase2 + 0.2) +
            0.035 * math.sin(phase3 + 0.5) +
            0.012 * math.sin(phase4)
        )

        breath_noise = (
            0.010 * math.sin(phase_noise) +
            0.006 * math.sin(phase_noise * 1.9 + 1.3) +
            0.004 * math.sin(phase_noise * 2.7 + 0.7)
        )
        chiff = 0.0
        if i < attack:
            chiff = (1.0 - i / max(1, attack)) * 0.018 * math.sin(2 * math.pi * 2500 * t)

        if i < attack:
            env = i / max(1, attack)
        elif i < attack + decay:
            decay_progress = (i - attack) / max(1, decay)
            env = 1.0 - decay_progress * 0.12
        elif i > sustain_end:
            env = max(0.0, (total - i) / max(1, release))
        else:
            env = 0.88

        air = 0.55 + 0.45 * min(1.0, i / max(1, attack + decay))
        sample = (tone + air * breath_noise + chiff) * env * VOLUME
        samples.append(sample)
    return lowpass(samples, cutoff_hz=2400.0)


def rest(duration: float) -> list[float]:
    return [0.0] * int(SAMPLE_RATE * duration)


def write_wav(path: Path, samples: list[float]) -> None:
    with wave.open(str(path), "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for sample in samples:
            clamped = max(-1.0, min(1.0, sample))
            frames.extend(struct.pack("<h", int(clamped * 32767)))
        wav_file.writeframes(frames)


def render_sequence(name: str, notes: list[str], note_duration: float, gap: float) -> Path:
    samples: list[float] = []
    for note in notes:
        freq = midi_to_freq(NOTE_TO_MIDI[note])
        samples.extend(synth_tone(freq, note_duration))
        samples.extend(rest(gap))
    path = OUT_DIR / f"{name}.wav"
    write_wav(path, samples)
    return path


def write_simple_midi(path: Path, tracks: list[tuple[str, list[str], int]]) -> None:
    ticks_per_quarter = 480

    def var_len(value: int) -> bytes:
        buffer = value & 0x7F
        out = bytearray()
        while value >> 7:
            value >>= 7
            buffer <<= 8
            buffer |= ((value & 0x7F) | 0x80)
        while True:
            out.append(buffer & 0xFF)
            if buffer & 0x80:
                buffer >>= 8
            else:
                break
        return bytes(out)

    def track_chunk(title: str, notes: list[str], bpm: int) -> bytes:
        data = bytearray()
        data.extend(var_len(0))
        data.extend(b"\xFF\x03")
        title_bytes = title.encode("utf-8")
        data.extend(var_len(len(title_bytes)))
        data.extend(title_bytes)

        mpqn = int(60000000 / bpm)
        data.extend(var_len(0))
        data.extend(b"\xFF\x51\x03")
        data.extend(mpqn.to_bytes(3, "big"))

        for note in notes:
            midi_note = NOTE_TO_MIDI[note]
            data.extend(var_len(0))
            data.extend(bytes([0x90, midi_note, 88]))
            data.extend(var_len(360))
            data.extend(bytes([0x80, midi_note, 0]))
            data.extend(var_len(60))

        data.extend(var_len(0))
        data.extend(b"\xFF\x2F\x00")
        return b"MTrk" + len(data).to_bytes(4, "big") + data

    header = b"MThd" + (6).to_bytes(4, "big") + (1).to_bytes(2, "big") + len(tracks).to_bytes(2, "big") + ticks_per_quarter.to_bytes(2, "big")
    chunks = [track_chunk(title, notes, bpm) for title, notes, bpm in tracks]
    path.write_bytes(header + b"".join(chunks))


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    a25 = render_sequence("alankar-25-practice", ALANKAR_25, 0.36, 0.04)
    a26 = render_sequence("alankar-26-practice", ALANKAR_26, 0.36, 0.04)
    a27 = render_sequence("alankar-27-practice", ALANKAR_27, 0.42, 0.05)

    combined_samples: list[float] = []
    sections = [
        ("Alankar 25", ALANKAR_25, 0.36, 0.04),
        ("Alankar 26", ALANKAR_26, 0.36, 0.04),
        ("Alankar 27", ALANKAR_27, 0.42, 0.05),
    ]
    for _, notes, note_duration, gap in sections:
        for note in notes:
            combined_samples.extend(synth_tone(midi_to_freq(NOTE_TO_MIDI[note]), note_duration))
            combined_samples.extend(rest(gap))
        combined_samples.extend(rest(0.7))
    combined = OUT_DIR / "alankars-25-26-27-practice.wav"
    write_wav(combined, combined_samples)

    midi_path = OUT_DIR / "alankars-25-26-27-practice.mid"
    write_simple_midi(
        midi_path,
        [
            ("Alankar 25", ALANKAR_25, 96),
            ("Alankar 26", ALANKAR_26, 96),
            ("Alankar 27", ALANKAR_27, 88),
        ],
    )

    print(a25)
    print(a26)
    print(a27)
    print(combined)
    print(midi_path)


if __name__ == "__main__":
    main()
