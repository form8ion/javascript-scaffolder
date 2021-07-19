import {promises as fsPromises} from 'fs';
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

    sandbox.stub(fsPromises, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the babelrc is written if a preset is defined', async () => {
    const babelPresetName = any.string();
    const babelPresetPackageName = any.word();
    const babelPreset = {name: babelPresetName, packageName: babelPresetPackageName};

    assert.deepEqual(
      await scaffoldBabel({preset: babelPreset, projectRoot, tests: {unit: true}, buildDirectory}),
      {
        devDependencies: ['@babel/register', babelPresetPackageName, 'babel-plugin-istanbul'],
        scripts: {},
        vcsIgnore: {files: [], directories: []}
      }
    );

    assert.calledWith(
      fsPromises.writeFile,
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
      {
        devDependencies: ['@babel/register', babelPresetPackageName],
        scripts: {},
        vcsIgnore: {files: [], directories: []}
      }
    );

    assert.calledWith(
      fsPromises.writeFile,
      `${projectRoot}/.babelrc`,
      JSON.stringify({presets: [babelPresetName], ignore: [`./${buildDirectory}/`]})
    );
  });

  test('that the babelrc is not written if a preset is not defined', async () => {
    assert.deepEqual(
      await scaffoldBabel({preset: undefined, projectRoot}),
      {
        devDependencies: [],
        scripts: {},
        vcsIgnore: {files: [], directories: []}
      }
    );

    assert.notCalled(fsPromises.writeFile);
  });

  test('that scaffolding is skipped if `transpileLint` is false', async () => {
    assert.deepEqual(
      await scaffoldBabel({preset: any.simpleObject(), projectRoot, transpileLint: false}),
      {devDependencies: [], scripts: {}, vcsIgnore: {files: [], directories: []}}
    );

    assert.notCalled(fsPromises.writeFile);
  });
});
