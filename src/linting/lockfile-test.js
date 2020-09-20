import {assert} from 'chai';
import scaffoldLockfileLint from './lockfile';

suite('lockfile linting', () => {
  test('that the default config is defined', async () => {
    const {devDependencies, scripts} = await scaffoldLockfileLint();

    assert.deepEqual(devDependencies, ['lockfile-lint']);
    assert.equal(
      scripts['lint:lockfile'],
      'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm'
    );
  });
});
