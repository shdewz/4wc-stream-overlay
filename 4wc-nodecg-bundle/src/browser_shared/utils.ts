export const delay = async (time: number): Promise<void> => new Promise(resolve => setTimeout(resolve, time));

// todo: migrate to tosu v2 API for BPM
export const getModdedStats = (cs_raw: number, ar_raw: number, od_raw: number, /* bpm_raw: number, */length_raw: number, mods: string) => {
    mods = mods.replace('NC', 'DT');

    const speed = mods.includes('DT') ? 1.5 : mods.includes('HT') ? 0.75 : 1;

    let ar = mods.includes('HR') ? ar_raw * 1.4 : mods.includes('EZ') ? ar_raw * 0.5 : ar_raw;
    const ar_ms = Math.max(Math.min(ar <= 5 ? 1800 - 120 * ar : 1200 - 150 * (ar - 5), 1800), 450) / speed;
    ar = ar < 5 ? (1800 - ar_ms) / 120 : 5 + (1200 - ar_ms) / 150;

    const cs = mods.includes('HR') ? cs_raw * 1.3 : mods.includes('EZ') ? cs_raw * 0.5 : cs_raw;

    let od = Math.min(mods.includes('HR') ? od_raw * 1.4 : mods.includes('EZ') ? od_raw * 0.5 : od_raw, 10);
    if (speed !== 1) od = (79.5 - Math.min(79.5, Math.max(19.5, 79.5 - Math.ceil(6 * od))) / speed) / 6;

    return {
        cs: cs,
        csRaw: cs_raw,
        ar: ar,
        arRaw: ar_raw,
        od: od,
        odRaw: od_raw,
        // bpm: Math.round(bpm_raw * speed * 10) / 10,
        // bpmRaw: bpm_raw,
        length: length_raw/speed,
        lengthRaw: length_raw,
        speed
    }
}

/**
 * turns a duration to human-readable length
 * @param len duration (in ms)
 */
export function formatLength(len: number) {
    let secs = Math.ceil(len / 1000);
    const mins = Math.floor(secs / 60);
    secs -= mins * 60;

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
