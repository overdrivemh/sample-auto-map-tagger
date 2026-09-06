import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const workflow = fs.readFileSync(
  path.join(__dirname, '../../.github/workflows/cleanup.yml'),
  'utf8',
);

const ASSUME_ACTION =
  'uses: aws-actions/configure-aws-credentials@7474bc4690e29a8392af63c5b98e7449536d5c3a';

describe('nightly cleanup — cross-account credential custody', () => {
  it('pins external actions used before destructive cleanup', () => {
    expect(workflow).toContain(
      'uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262',
    );
    expect(workflow).toContain('persist-credentials: false');
    expect(workflow).toContain(
      'uses: actions/setup-python@a26af69be951a213d495a4c3e4e4022e16d87065',
    );
    expect(workflow).not.toContain('actions/checkout@v4');
    expect(workflow).not.toContain('actions/setup-python@v5');
    expect(workflow).not.toContain('aws-actions/configure-aws-credentials@v4');
  });

  it('fails closed on every AWS account transition', () => {
    const assumeBlocks = [
      ...workflow.matchAll(
        /      - name: Assume role — [^\n]+\n[\s\S]*?(?=\n      - name:)/g,
      ),
    ].map((match) => match[0]);

    expect(assumeBlocks).toHaveLength(7);
    for (const block of assumeBlocks) {
      expect(block).toContain(ASSUME_ACTION);
      expect(block).toContain('unset-current-credentials: true');
      expect(block).not.toContain('continue-on-error: true');
    }
  });

  it('binds every destructive account block to an STS account identity check', () => {
    expect((workflow.match(/- name: Verify AWS identity —/g) || [])).toHaveLength(7);
    expect((workflow.match(/EXPECTED_ACCOUNT_ID:/g) || [])).toHaveLength(7);
    expect((workflow.match(/aws sts get-caller-identity --query Account --output text/g) || [])).toHaveLength(7);
    expect((workflow.match(/test "\$actual" = "\$EXPECTED_ACCOUNT_ID"/g) || [])).toHaveLength(7);
  });
});
