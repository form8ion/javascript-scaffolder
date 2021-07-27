import {promises as fsPromises} from 'fs';
import mustache from 'mustache';
import * as core from '@form8ion/core';
import * as jsCore from '@form8ion/javascript-core';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as camelcase from '../../../third-party-wrappers/camelcase';
import * as mkdir from '../../../third-party-wrappers/make-dir';
import * as touch from '../../../third-party-wrappers/touch';
import * as templatePath from '../../template-path';
import * as rollupScaffolder from '../../build/rollup';
import * as packageChooser from '../prompt';
import * as documentationScaffolder from './documentation';
import * as defineBadges from './badges';
import scaffoldPackage from './scaffolder';

suite('package project-type', () => {
  let sandbox;
  const projectRoot = any.string();
  const packageTypes = any.simpleObject();
  const projectName = any.word();
  const packageName = any.word();
  const packageManager = any.word();
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
  const eslintConfigs = any.listOf(any.string);
  const chosenType = any.word();
  const tests = any.simpleObject();
  const decisions = any.simpleObject();
  const pathToExampleTemplate = any.string();
  const exampleTemplateContent = any.string();
  const exampleContent = any.string();
  const camelizedProjectName = any.word();
  const pathToExample = `${projectRoot}/example.js`;
  const typeScaffoldingResults = {
    dependencies: scaffoldedTypeDependencies,
    devDependencies: scaffoldedTypeDevDependencies,
    scripts: scaffoldedTypeScripts,
    vcsIgnore: {files: scaffoldedFilesToIgnore, directories: scaffoldedDirectoriesToIgnore},
    eslintConfigs
  };

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(mkdir, 'default');
    sandbox.stub(touch, 'default');
    sandbox.stub(camelcase, 'default');
    sandbox.stub(fsPromises, 'copyFile');
    sandbox.stub(fsPromises, 'readFile');
    sandbox.stub(fsPromises, 'writeFile');
    sandbox.stub(templatePath, 'default');
    sandbox.stub(rollupScaffolder, 'scaffold');
    sandbox.stub(defineBadges, 'default');
    sandbox.stub(documentationScaffolder, 'default');
    sandbox.stub(packageChooser, 'default');
    sandbox.stub(core, 'fileExists');
    sandbox.stub(jsCore, 'scaffoldChoice');
    sandbox.stub(mustache, 'render');

    documentationScaffolder.default.withArgs({scope, packageName, visibility, packageManager}).returns(documentation);
    packageChooser.default.withArgs({types: packageTypes, projectType: 'package', decisions}).returns(chosenType);
    jsCore.scaffoldChoice
      .withArgs(packageTypes, chosenType, {projectRoot, projectName, packageName, tests, scope})
      .returns(typeScaffoldingResults);

    templatePath.default.withArgs('example.mustache').returns(pathToExampleTemplate);
    fsPromises.readFile.withArgs(pathToExampleTemplate, 'utf8').resolves(exampleTemplateContent);
    camelcase.default.withArgs(projectName).returns(camelizedProjectName);
    mustache.render.withArgs(exampleTemplateContent, {projectName: camelizedProjectName}).returns(exampleContent);
  });

  teardown(() => sandbox.restore());

  test('that details specific to a package project-type are scaffolded', async () => {
    const rollupResults = any.simpleObject();
    rollupScaffolder.scaffold.withArgs({projectRoot}).resolves(rollupResults);
    defineBadges.default.withArgs(packageName, visibility).returns(badges);
    core.fileExists.withArgs(pathToExample).resolves(false);

    assert.deepEqual(
      await scaffoldPackage({
        projectRoot,
        projectName,
        packageName,
        packageManager,
        visibility,
        scope,
        packageTypes,
        tests,
        decisions,
        dialect: jsCore.dialects.BABEL
      }),
      {
        ...rollupResults,
        dependencies: scaffoldedTypeDependencies,
        devDependencies: [...scaffoldedTypeDevDependencies, 'rimraf'],
        scripts: {
          clean: 'rimraf ./lib',
          prebuild: 'run-s clean',
          build: 'npm-run-all --print-label --parallel build:*',
          prepack: 'run-s build',
          ...scaffoldedTypeScripts
        },
        vcsIgnore: {directories: [...scaffoldedDirectoriesToIgnore, '/lib/'], files: scaffoldedFilesToIgnore},
        buildDirectory: 'lib',
        badges,
        packageProperties: {
          ...commonPackageProperties,
          sideEffects: false,
          main: 'lib/index.cjs.js',
          module: 'lib/index.es.js',
          files: ['example.js', 'lib/'],
          publishConfig: {access: 'restricted'}
        },
        documentation,
        eslintConfigs,
        nextSteps: commonNextSteps
      }
    );
    assert.calledWith(fsPromises.writeFile, pathToExample, exampleContent);
  });

  test('that an existing example file is not overwritten', async () => {
    core.fileExists.withArgs(pathToExample).resolves(true);

    await scaffoldPackage({
      projectRoot,
      projectName,
      packageName,
      packageManager,
      visibility,
      scope,
      packageTypes,
      tests,
      decisions
    });

    assert.neverCalledWith(fsPromises.writeFile, pathToExample);
  });

  test('that the runkit badge is included for public projects', async () => {
    const pathToCreatedSrcDirectory = any.string();
    defineBadges.default.withArgs(packageName, 'Public').returns(badges);
    core.fileExists.withArgs(pathToExample).resolves(false);
    mkdir.default.withArgs(`${projectRoot}/src`).resolves(pathToCreatedSrcDirectory);

    const results = await scaffoldPackage({
      projectRoot,
      projectName,
      packageName,
      visibility: 'Public',
      packageTypes,
      tests,
      decisions,
      scope,
      dialect: jsCore.dialects.BABEL
    });

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
        files: ['example.js', 'lib/'],
        publishConfig: {access: 'public'},
        runkitExampleFilename: './example.js'
      }
    );
    assert.calledWith(fsPromises.writeFile, pathToExample, exampleContent);
    assert.calledWith(touch.default, `${pathToCreatedSrcDirectory}/index.js`);
  });

  test('that build details are not included when the project will not be transpiled', async () => {
    defineBadges.default.withArgs(packageName, visibility).returns(badges);

    assert.deepEqual(
      await scaffoldPackage({
        projectRoot,
        packageName,
        projectName,
        packageManager,
        visibility,
        scope,
        decisions,
        packageTypes,
        tests,
        dialect: jsCore.dialects.COMMON_JS
      }),
      {
        dependencies: scaffoldedTypeDependencies,
        devDependencies: scaffoldedTypeDevDependencies,
        scripts: scaffoldedTypeScripts,
        vcsIgnore: {directories: scaffoldedDirectoriesToIgnore, files: scaffoldedFilesToIgnore},
        badges,
        packageProperties: {
          ...commonPackageProperties,
          files: ['example.js', 'index.js'],
          publishConfig: {access: 'restricted'}
        },
        documentation,
        eslintConfigs,
        nextSteps: commonNextSteps
      }
    );
    assert.calledWith(
      fsPromises.writeFile,
      pathToExample,
      `const ${camelizedProjectName} = require('.');\n`
    );
    assert.calledWith(touch.default, `${projectRoot}/index.js`);
  });
});
