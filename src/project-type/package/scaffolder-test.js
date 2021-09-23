import * as jsCore from '@form8ion/javascript-core';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as packageChooser from '../prompt';
import * as documentationScaffolder from './documentation';
import * as defineBadges from './badges';
import * as buildDetails from './build-details';
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
  const typeScaffoldingResults = {
    dependencies: scaffoldedTypeDependencies,
    devDependencies: scaffoldedTypeDevDependencies,
    scripts: scaffoldedTypeScripts,
    vcsIgnore: {files: scaffoldedFilesToIgnore, directories: scaffoldedDirectoriesToIgnore},
    eslintConfigs
  };

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(buildDetails, 'default');
    sandbox.stub(defineBadges, 'default');
    sandbox.stub(documentationScaffolder, 'default');
    sandbox.stub(packageChooser, 'default');
    sandbox.stub(jsCore, 'scaffoldChoice');

    documentationScaffolder.default.withArgs({scope, packageName, visibility, packageManager}).returns(documentation);
    packageChooser.default.withArgs({types: packageTypes, projectType: 'package', decisions}).returns(chosenType);
    jsCore.scaffoldChoice
      .withArgs(packageTypes, chosenType, {projectRoot, projectName, packageName, tests, scope})
      .returns(typeScaffoldingResults);
  });

  teardown(() => sandbox.restore());

  test('that details specific to a package project-type are scaffolded', async () => {
    const buildDetailsResults = any.simpleObject();
    const dialect = jsCore.dialects.BABEL;
    defineBadges.default.withArgs(packageName, visibility).returns(badges);
    buildDetails.default
      .withArgs({projectRoot, projectName, visibility, packageName, dialect})
      .resolves(buildDetailsResults);

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
        dialect
      }),
      {
        ...buildDetailsResults,
        dependencies: scaffoldedTypeDependencies,
        devDependencies: scaffoldedTypeDevDependencies,
        scripts: scaffoldedTypeScripts,
        vcsIgnore: {directories: scaffoldedDirectoriesToIgnore, files: scaffoldedFilesToIgnore},
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
  });
});
