import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../.github/ISSUE_TEMPLATE/', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');

describe('public GitHub issue intake', () => {
    it.each(['bug-report.yml', 'feature-request.yml', 'science-correction.yml', 'accessibility.yml'])(
        'provides %s',
        (name) => expect(existsSync(new URL(name, root))).toBe(true)
    );

    it('prevents unstructured reports and points users to privacy guidance', () => {
        const config = read('config.yml');
        expect(config).toContain('blank_issues_enabled: false');
        expect(config).toContain('/privacidade/');
        expect(config).toContain('name: Privacy and personal data');
        expect(config).toContain('name: General project discussions');
    });

    it.each([
        ['bug-report.yml', 'name: Report a bug'],
        ['feature-request.yml', 'name: Suggest an improvement'],
        ['science-correction.yml', 'name: Correct science or content'],
        ['accessibility.yml', 'name: Report an accessibility issue']
    ])('presents %s in English', (name, heading) => {
        expect(read(name)).toContain(heading);
    });
});
