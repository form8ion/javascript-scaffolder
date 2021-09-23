import {promises as fsPromises} from 'fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as rollupScaffolder from '../build/rollup';
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
    sandbox.stub(rollupScaffolder, 'scaffold');
    sandbox.stub(defineBadges, 'default');
  });

  teardown(() => sandbox.restore());

  test('that details specific to a cli project-type are scaffolded', async () => {
    const visibility = 'Private';
    const rollupResults = any.simpleObject();
    const dialect = any.word();
    rollupScaffolder.scaffold.withArgs({projectRoot, dialect}).resolves(rollupResults);
    defineBadges.default.withArgs(packageName, visibility).returns(badges);

    assert.deepEqual(
      await scaffoldCli({projectRoot, configs, packageName, visibility, dialect}),
      {
        ...rollupResults,
        scripts: {
          clean: 'rimraf ./bin',
          prebuild: 'run-s clean',
          build: 'npm-run-all --print-label --parallel build:*',
          prepack: 'run-s build'
        },
        dependencies: ['update-notifier'],
        devDependencies: [
          'rimraf',
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
  });

  test('that the package is published publically when the visibility is `Public`', async () => {
    const results = await scaffoldCli({projectRoot, configs, packageName, visibility: 'Public'});

    assert.equal(results.packageProperties.publishConfig.access, 'public');
  });
});
