import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as templatePath from '../../../../src/template-path';
import * as defineBadges from '../../../../src/project-type/package/badges';
import * as documentationScaffolder from '../../../../src/project-type/package/documentation';
import scaffoldPackage from '../../../../src/project-type/package/scaffolder';

suite('package project-type', () => {
  let sandbox;
  const packageName = any.word();
  const badges = {consumer: any.simpleObject(), contribution: any.simpleObject(), status: any.simpleObject()};
  const commonPackageProperties = {version: '0.0.0-semantically-released'};

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'copyFile');
    sandbox.stub(templatePath, 'default');
    sandbox.stub(defineBadges, 'default');
    sandbox.stub(documentationScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that details specific to a package project-type are scaffolded', async () => {
    const projectRoot = any.string();
    const pathToTemplate = any.string();
    const visibility = 'Private';
    const documentation = any.simpleObject();
    const scope = any.word();
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);
    defineBadges.default.withArgs(packageName, visibility).returns(badges);
    documentationScaffolder.default.withArgs({scope, packageName, visibility}).returns(documentation);

    assert.deepEqual(
      await scaffoldPackage({projectRoot, packageName, visibility, scope}),
      {
        devDependencies: ['rimraf', 'rollup', 'rollup-plugin-auto-external'],
        scripts: {
          clean: 'rimraf ./lib',
          prebuild: 'run-s clean',
          build: 'npm-run-all --print-label --parallel build:*',
          'build:js': 'rollup --config',
          watch: 'run-s \'build:js -- --watch\'',
          prepack: 'run-s build'
        },
        vcsIgnore: {directories: ['/lib/']},
        buildDirectory: 'lib',
        badges,
        packageProperties: {
          ...commonPackageProperties,
          sideEffects: false,
          main: 'lib/index.cjs.js',
          module: 'lib/index.es.js',
          files: ['lib/'],
          publishConfig: {access: 'restricted'}
        },
        documentation
      }
    );
    assert.calledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });

  test('that the runkit badge is included for public projects', async () => {
    const projectRoot = any.string();
    const pathToTemplate = any.string();
    const visibility = 'Public';
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);
    defineBadges.default.withArgs(packageName, visibility).returns(badges);

    const results = await scaffoldPackage({projectRoot, packageName, visibility});

    assert.deepEqual(
      results.badges.consumer.runkit,
      {
        img: `https://badge.runkitcdn.com/${packageName}.svg`,
        text: `Try ${packageName} on RunKit`,
        link: `https://npm.runkit.com/${packageName}`
      }
    );
    assert.deepEqual(
      results.packageProperties,
      {
        ...commonPackageProperties,
        sideEffects: false,
        main: 'lib/index.cjs.js',
        module: 'lib/index.es.js',
        files: ['lib/'],
        publishConfig: {access: 'public'}
      }
    );
    assert.calledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });

  test('that build details are not included when the project will not be transpiled', async () => {
    const projectRoot = any.string();
    const pathToTemplate = any.string();
    const visibility = 'Private';
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);
    defineBadges.default.withArgs(packageName, visibility).returns(badges);

    assert.deepEqual(
      await scaffoldPackage({projectRoot, transpileLint: false, packageName, visibility}),
      {
        scripts: {},
        badges,
        packageProperties: {...commonPackageProperties, files: ['index.js'], publishConfig: {access: 'restricted'}}
      }
    );
    assert.neverCalledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });
});
