import sinon from 'sinon';
import {assert} from 'chai';
import * as dependencyInstaller from '../../../src/package/install';
import installDependencies from '../../../src/package/dependencies';

suite('dependencies', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(dependencyInstaller, 'default');
  });

  teardown(() => sandbox.restore());

  test('that devDependencies get installed', async () => {
    await installDependencies();

    assert.calledWith(dependencyInstaller.default, ['npm-run-all', 'ban-sensitive-files']);
  });
});
