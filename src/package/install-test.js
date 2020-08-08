import {DEV_DEPENDENCY_TYPE} from '@form8ion/javascript-core';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as execa from '../../third-party-wrappers/execa';
import npmInstall from './install';

suite('npm install', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(execa, 'default');
  });

  teardown(() => sandbox.restore());

  test('that `npm install` is not run when no dependencies need to be installed', async () => {
    await npmInstall([]);

    assert.notCalled(execa.default);
  });

  test('that dependencies are installed', async () => {
    const duplicateDependency = any.word();
    const uniqueDependencies = any.listOf(any.word);
    const dependencies = [duplicateDependency, ...uniqueDependencies, duplicateDependency];
    const dependenciesType = any.word();

    await npmInstall(dependencies, dependenciesType);

    assert.calledWith(
      execa.default,
      `. ~/.nvm/nvm.sh && nvm use && npm install ${
        [duplicateDependency, ...uniqueDependencies].join(' ')
      } --save-${dependenciesType}`,
      {shell: true}
    );
  });

  test('that devDependencies are installed with pinned versions', async () => {
    const duplicateDependency = any.word();
    const uniqueDependencies = any.listOf(any.word);
    const dependencies = [duplicateDependency, ...uniqueDependencies, duplicateDependency];

    await npmInstall(dependencies, DEV_DEPENDENCY_TYPE);

    assert.calledWith(
      execa.default,
      `. ~/.nvm/nvm.sh && nvm use && npm install ${
        [duplicateDependency, ...uniqueDependencies].join(' ')
      } --save-${DEV_DEPENDENCY_TYPE} --save-exact`,
      {shell: true}
    );
  });
});
