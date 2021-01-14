import {promises as fs} from 'fs';
import {packageManagers} from '@form8ion/javascript-core';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import scaffoldLockfileLint from './lockfile';

suite('lockfile linting', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that it is configured properly for npm', async () => {
    const {devDependencies, scripts} = await scaffoldLockfileLint({projectRoot, packageManager: packageManagers.NPM});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.lockfile-lintrc.json`,
      JSON.stringify({
        path: 'package-lock.json',
        type: packageManagers.NPM,
        'validate-https': true,
        'allowed-hosts': [packageManagers.NPM]
      })
    );
    assert.deepEqual(devDependencies, ['lockfile-lint']);
    assert.equal(scripts['lint:lockfile'], 'lockfile-lint');
  });

  test('that it is configured properly for yarn', async () => {
    const {devDependencies, scripts} = await scaffoldLockfileLint({projectRoot, packageManager: packageManagers.YARN});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.lockfile-lintrc.json`,
      JSON.stringify({
        path: 'yarn.lock',
        type: packageManagers.YARN,
        'validate-https': true,
        'allowed-hosts': [packageManagers.YARN]
      })
    );
    assert.deepEqual(devDependencies, ['lockfile-lint']);
    assert.equal(scripts['lint:lockfile'], 'lockfile-lint');
  });

  test('that an error is thrown for unsupported package managers', async () => {
    const packageManager = any.word();

    try {
      await scaffoldLockfileLint({projectRoot, packageManager});

      throw new Error('An error should have been thrown for the unsupported package manager');
    } catch (e) {
      assert.equal(
        e.message,
        `The ${packageManager} package manager is currently not supported. `
        + `Only ${Object.values(packageManagers).join(' and ')} are currently supported.`
      );
    }
  });
});
