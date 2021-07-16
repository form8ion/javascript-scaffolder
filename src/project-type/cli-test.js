import {promises as fsPromises} from 'fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as templatePath from '../template-path';
import * as defineBadges from './package/badges';
import scaffoldCli from './cli';

suite('cli project-type', () => {
  let sandbox;
  const projectRoot = any.string();
  const packageName = any.word();
  const badges = any.simpleObject();
  const configs = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'copyFile');
    sandbox.stub(templatePath, 'default');
    sandbox.stub(defineBadges, 'default');
  });

  teardown(() => sandbox.restore());

  test('that details specific to a cli project-type are scaffolded', async () => {
    const visibility = 'Private';
    const pathToTemplate = any.string();
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);
    defineBadges.default.withArgs(packageName, visibility).returns(badges);

    assert.deepEqual(
      await scaffoldCli({projectRoot, configs, packageName, visibility}),
      {
        scripts: {
          clean: 'rimraf ./bin',
          prebuild: 'run-s clean',
          build: 'npm-run-all --print-label --parallel build:*',
          'build:js': 'rollup --config',
          watch: 'run-s \'build:js -- --watch\'',
          prepack: 'run-s build'
        },
        dependencies: ['update-notifier'],
        devDependencies: [
          'rimraf',
          'rollup',
          '@rollup/plugin-auto-external',
          '@rollup/plugin-json',
          'rollup-plugin-executable'
        ],
        vcsIgnore: {files: [], directories: ['/bin/']},
        buildDirectory: 'bin',
        badges,
        packageProperties: {
          version: '0.0.0-semantically-released',
          bin: {},
          files: ['bin/'],
          publishConfig: {access: 'restricted'}
        },
        eslintConfigs: [],
        nextSteps: []
      }
    );
    assert.calledWith(fsPromises.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });

  test('that the package is published publically when the visibility is `Public`', async () => {
    const results = await scaffoldCli({projectRoot, configs, packageName, visibility: 'Public'});

    assert.equal(results.packageProperties.publishConfig.access, 'public');
  });
});
