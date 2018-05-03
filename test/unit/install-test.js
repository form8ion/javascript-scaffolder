import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as exec from '../../third-party-wrappers/exec-as-promised';
import npmInstall from '../../src/install';

suite('npm install', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(exec, 'default');
  });

  teardown(() => sandbox.restore());

  test('that `npm install` is not run when no dependencies need to be installed', async () => {
    await npmInstall([]);

    assert.notCalled(exec.default);
  });

  suite('devDependencies', () => {
    test('that devDependencies are installed', async () => {
      const devDependencies = any.listOf(any.word);

      await npmInstall(devDependencies);

      assert.calledWith(
        exec.default,
        `. ~/.nvm/nvm.sh && nvm use && npm install ${devDependencies.join(' ')} --save-dev`,
        {silent: false}
      );
    });
  });
});
