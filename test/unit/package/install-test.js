import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import execa from 'execa';
import npmInstall from '../../../src/package/install';

suite('npm install', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(execa, 'shell');
  });

  teardown(() => sandbox.restore());

  test('that `npm install` is not run when no dependencies need to be installed', async () => {
    await npmInstall([]);

    assert.notCalled(execa.shell);
  });

  suite('devDependencies', () => {
    test('that devDependencies are installed', async () => {
      const duplicateDependency = any.word();
      const uniqueDependencies = any.listOf(any.word);
      const dependencies = [duplicateDependency, ...uniqueDependencies, duplicateDependency];
      const dependenciesType = any.word();

      await npmInstall(dependencies, dependenciesType);

      assert.calledWith(
        execa.shell,
        `. ~/.nvm/nvm.sh && nvm use && npm install ${
          [duplicateDependency, ...uniqueDependencies].join(' ')
        } --save-${dependenciesType}`
      );
    });
  });
});
