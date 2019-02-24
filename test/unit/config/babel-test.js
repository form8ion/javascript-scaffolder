import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import scaffoldBabel from '../../../src/config/babel';

suite('babel config', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the babelrc is written if a preset is defined', async () => {
    const babelPresetName = any.string();
    const babelPresetPackageName = any.word();
    const babelPreset = {name: babelPresetName, packageName: babelPresetPackageName};

    assert.deepEqual(
      await scaffoldBabel({preset: babelPreset, projectRoot}),
      {devDependencies: ['@babel/register', babelPresetPackageName]}
    );

    assert.calledWith(fs.writeFile, `${projectRoot}/.babelrc`, JSON.stringify({presets: [babelPresetName]}));
  });

  test('that the babelrc is not written if a preset is not defined', async () => {
    assert.deepEqual(await scaffoldBabel({
      preset: undefined,
      projectRoot
    }), {devDependencies: ['@babel/register']});

    assert.notCalled(fs.writeFile);
  });
});
