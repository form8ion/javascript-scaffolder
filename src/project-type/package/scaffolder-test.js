import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as templatePath from '../../template-path';
import * as defineBadges from './badges';
import * as documentationScaffolder from './documentation';
import * as packageChooser from '../prompt';
import * as choiceScaffolder from '../../choice-scaffolder';
import scaffoldPackage from './scaffolder';

suite('package project-type', () => {
  let sandbox;
  const projectRoot = any.string();
  const packageTypes = any.simpleObject();
  const packageName = any.word();
  const visibility = 'Private';
  const scope = any.word();
  const badges = {consumer: any.simpleObject(), contribution: any.simpleObject(), status: any.simpleObject()};
  const commonPackageProperties = {version: '0.0.0-semantically-released'};
  const commonNextSteps = [
    {summary: 'Add the appropriate `save` flag to the installation instructions in the README'},
    {summary: 'Publish pre-release versions to npm until package is stable enough to publish v1.0.0'}
  ];
  const documentation = any.simpleObject();
  const scaffoldedTypeDependencies = any.listOf(any.string);
  const scaffoldedTypeDevDependencies = any.listOf(any.string);
  const scaffoldedTypeScripts = any.simpleObject();
  const scaffoldedFilesToIgnore = any.listOf(any.string);
  const scaffoldedDirectoriesToIgnore = any.listOf(any.string);
  const scaffoldedDocumentation = any.listOf(any.string);
  const eslintConfigs = any.listOf(any.string);
  const chosenType = any.word();
  const tests = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'copyFile');
    sandbox.stub(templatePath, 'default');
    sandbox.stub(defineBadges, 'default');
    sandbox.stub(documentationScaffolder, 'default');
    sandbox.stub(packageChooser, 'default');
    sandbox.stub(choiceScaffolder, 'default');

    documentationScaffolder.default.withArgs({scope, packageName, visibility}).returns(documentation);
    packageChooser.default.withArgs({types: packageTypes, projectType: 'package'}).returns(chosenType);
  });

  teardown(() => sandbox.restore());

  test('that details specific to a package project-type are scaffolded', async () => {
    const pathToTemplate = any.string();
    const typeScaffoldingResults = {
      ...any.simpleObject(),
      dependencies: scaffoldedTypeDependencies,
      devDependencies: scaffoldedTypeDevDependencies,
      scripts: scaffoldedTypeScripts,
      vcsIgnore: {files: scaffoldedFilesToIgnore, directories: scaffoldedDirectoriesToIgnore},
      documentation: scaffoldedDocumentation,
      eslintConfigs
    };
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);
    defineBadges.default.withArgs(packageName, visibility).returns(badges);
    documentationScaffolder.default.withArgs({scope, packageName, visibility}).returns(documentation);
    choiceScaffolder.default.withArgs(packageTypes, chosenType, {projectRoot, tests}).returns(typeScaffoldingResults);

    assert.deepEqual(
      await scaffoldPackage({projectRoot, packageName, visibility, scope, packageTypes, tests}),
      {
        dependencies: scaffoldedTypeDependencies,
        devDependencies: ['rimraf', 'rollup', 'rollup-plugin-auto-external', ...scaffoldedTypeDevDependencies],
        scripts: {
          clean: 'rimraf ./lib',
          prebuild: 'run-s clean',
          build: 'npm-run-all --print-label --parallel build:*',
          'build:js': 'rollup --config',
          watch: 'run-s \'build:js -- --watch\'',
          prepack: 'run-s build',
          ...scaffoldedTypeScripts
        },
        vcsIgnore: {directories: ['/lib/', ...scaffoldedDirectoriesToIgnore], files: scaffoldedFilesToIgnore},
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
        documentation,
        eslintConfigs,
        nextSteps: commonNextSteps
      }
    );
    assert.calledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });

  test('that the runkit badge is included for public projects', async () => {
    const pathToTemplate = any.string();
    const typeScaffoldingResults = any.simpleObject();
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);
    defineBadges.default.withArgs(packageName, 'Public').returns(badges);
    choiceScaffolder.default.withArgs(packageTypes, chosenType, {projectRoot, tests}).returns(typeScaffoldingResults);

    const results = await scaffoldPackage({projectRoot, packageName, visibility: 'Public', packageTypes, tests});

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

  test('that the greenkeeper details are included for public projects when the vcs-host is GitHub', async () => {
    const vcs = {host: 'GitHub', owner: any.word(), name: any.word()};
    const typeScaffoldingResults = any.simpleObject();
    defineBadges.default.withArgs(packageName, 'Public').returns(badges);
    choiceScaffolder.default.withArgs(packageTypes, chosenType, {projectRoot, tests}).returns(typeScaffoldingResults);

    const results = await scaffoldPackage({projectRoot, packageName, visibility: 'Public', packageTypes, tests, vcs});

    assert.deepEqual(
      results.badges.consumer.greenkeeper,
      {
        img: `https://badges.greenkeeper.io/${vcs.owner}/${vcs.name}.svg`,
        text: 'Greenkeeper',
        link: 'https://greenkeeper.io/'
      }
    );
    assert.deepEqual(
      results.nextSteps,
      [
        ...commonNextSteps,
        {summary: 'Register the greenkeeper-keeper webhook'},
        {summary: 'Add this repository to the Greenkeeper GitHub App list once v1.0.0 has been published'}
      ]
    );
  });

  test('that the greenkeeper details are not included when the vcs-host is not GitHub', async () => {
    const vcs = {host: any.word(), owner: any.word(), name: any.word()};
    const typeScaffoldingResults = any.simpleObject();
    defineBadges.default.withArgs(packageName, 'Public').returns(badges);
    choiceScaffolder.default.withArgs(packageTypes, chosenType, {projectRoot, tests}).returns(typeScaffoldingResults);

    const results = await scaffoldPackage({projectRoot, packageName, visibility: 'Public', packageTypes, tests, vcs});

    assert.isUndefined(results.badges.consumer.greenkeeper);
    assert.deepEqual(results.nextSteps, commonNextSteps);
  });

  test('that build details are not included when the project will not be transpiled', async () => {
    const pathToTemplate = any.string();
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);
    defineBadges.default.withArgs(packageName, visibility).returns(badges);

    assert.deepEqual(
      await scaffoldPackage({projectRoot, transpileLint: false, packageName, visibility, scope}),
      {
        scripts: {},
        badges,
        packageProperties: {...commonPackageProperties, files: ['index.js'], publishConfig: {access: 'restricted'}},
        documentation,
        eslintConfigs: [],
        nextSteps: commonNextSteps
      }
    );
    assert.neverCalledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });
});
