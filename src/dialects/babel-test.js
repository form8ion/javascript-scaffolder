import {promises as fs} from 'fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import scaffoldBabel from './babel';

suite('babel config', () => {
  let sandbox;
  const projectRoot = any.string();
  const buildDirectory = any.word();

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
      await scaffoldBabel({preset: babelPreset, projectRoot, tests: {unit: true}, buildDirectory}),
      {devDependencies: ['@babel/register', babelPresetPackageName, 'babel-plugin-istanbul'], eslint: {}}
    );

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.babelrc`,
      JSON.stringify({
        presets: [babelPresetName],
        ignore: [`./${buildDirectory}/`],
        env: {test: {plugins: ['istanbul']}}
      })
    );
  });

  test('that the istanbul plugin dependency is not included if unit testing is not desired', async () => {
    const babelPresetName = any.string();
    const babelPresetPackageName = any.word();
    const babelPreset = {name: babelPresetName, packageName: babelPresetPackageName};

    assert.deepEqual(
      await scaffoldBabel({preset: babelPreset, projectRoot, tests: {unit: false}, buildDirectory}),
      {devDependencies: ['@babel/register', babelPresetPackageName], eslint: {}}
    );

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.babelrc`,
      JSON.stringify({presets: [babelPresetName], ignore: [`./${buildDirectory}/`]})
    );
  });

  test('that an error is thrown if a preset is not defined', async () => {
    try {
      await scaffoldBabel({preset: undefined, projectRoot});

      throw new Error('test should have failed, but didnt');
    } catch (e) {
      assert.notCalled(fs.writeFile);
      assert.equal(e.message, 'No babel preset provided. Cannot configure babel transpilation');
    }
  });
});
