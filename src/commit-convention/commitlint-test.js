import fs from 'mz/fs';
import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import scaffoldCommitlint from './commitlint';

suite('commitlint scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that config is writted and dependencies are defined', async () => {
    const configPackageName = any.word();
    const configName = any.word();
    const projectRoot = any.string();

    assert.deepEqual(
      await scaffoldCommitlint({projectRoot, config: {packageName: configPackageName, name: configName}}),
      {devDependencies: [configPackageName]}
    );
    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.commitlintrc.js`,
      `module.exports = {extends: ['${configName}']};`
    );
  });
});
