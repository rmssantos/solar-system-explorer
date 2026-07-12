const runtimeEnv = import.meta.env ?? {};

export function formatBuildLabel(version, sha) {
    const normalizedVersion = String(version ?? '').trim() || '0.0.0-dev';
    const normalizedSha = String(sha ?? '').trim() || 'local';
    const revision = normalizedSha === 'local' ? normalizedSha : normalizedSha.slice(0, 7);
    return `v${normalizedVersion} · ${revision}`;
}

export function mountBuildInfo(root = globalThis.document, {
    version = runtimeEnv.VITE_APP_VERSION,
    sha = runtimeEnv.VITE_GIT_SHA
} = {}) {
    const label = formatBuildLabel(version, sha);
    root?.querySelectorAll?.('[data-build-version]').forEach((element) => {
        element.textContent = label;
        element.setAttribute('title', `Build ${label}`);
    });
    return label;
}
