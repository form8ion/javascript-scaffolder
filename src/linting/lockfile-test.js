import {promises as fs} from 'fs';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import scaffoldLockfileLint from './lockfile';

suite('lockfile linting', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the default config is defined', async () => {
    const projectRoot = any.string();

    const {devDependencies, scripts} = await scaffoldLockfileLint({projectRoot});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.lockfile-lintrc.json`,
      JSON.stringify({path: 'package-lock.json', type: 'npm', 'validate-https': true, 'allowed-hosts': ['npm']})
    );
    assert.deepEqual(devDependencies, ['lockfile-lint']);
    assert.equal(scripts['lint:lockfile'], 'lockfile-lint');
  });
});
