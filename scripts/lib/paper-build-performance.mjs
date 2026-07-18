function uniquePush(values, value) {
    if (value && !values.includes(value)) values.push(value);
}

export function analyzePaperManifest(manifest, requestedEntry = 'jogo/index.html') {
    const entryKey = manifest[requestedEntry]
        ? requestedEntry
        : Object.keys(manifest).find((key) => manifest[key]?.isEntry && key.replaceAll('\\', '/').endsWith(requestedEntry));
    if (!entryKey) throw new Error(`Missing ${requestedEntry} in Vite manifest`);

    const initialKeys = [];
    const visitInitial = (key) => {
        if (!manifest[key] || initialKeys.includes(key)) return;
        initialKeys.push(key);
        for (const dependency of manifest[key].imports ?? []) visitInitial(dependency);
    };
    visitInitial(entryKey);

    const dynamicKeys = [];
    const visitDynamic = (key) => {
        if (!manifest[key] || initialKeys.includes(key) || dynamicKeys.includes(key)) return;
        dynamicKeys.push(key);
        for (const dependency of manifest[key].imports ?? []) visitDynamic(dependency);
        for (const dependency of manifest[key].dynamicImports ?? []) visitDynamic(dependency);
    };
    for (const key of initialKeys) {
        for (const dependency of manifest[key].dynamicImports ?? []) visitDynamic(dependency);
    }

    const initialFiles = [];
    const dynamicFiles = [];
    for (const key of initialKeys) uniquePush(initialFiles, manifest[key]?.file);
    for (const key of dynamicKeys) uniquePush(dynamicFiles, manifest[key]?.file);
    const phaserPattern = /phaser/i;
    const phaserInInitial = initialKeys.some((key) => phaserPattern.test(key) || phaserPattern.test(manifest[key]?.file ?? ''));
    return Object.freeze({
        entryKey,
        initialKeys: Object.freeze(initialKeys),
        dynamicKeys: Object.freeze(dynamicKeys),
        initialFiles: Object.freeze(initialFiles),
        dynamicFiles: Object.freeze(dynamicFiles),
        phaserInInitial
    });
}
