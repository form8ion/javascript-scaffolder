import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as applicationChooser from './prompt';
import * as choiceScaffolder from '../choice-scaffolder';
import scaffoldApplication from './application';

suite('application project-type', () => {
  let sandbox;
  const projectRoot = any.string();
  const applicationTypes = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(applicationChooser, 'default');
    sandbox.stub(choiceScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that details specific to an application project-type are scaffolded', async () => {
    const chosenApplicationType = any.word();
    const scaffoldedTypeDependencies = any.listOf(any.string);
    const scaffoldedTypeDevDependencies = any.listOf(any.string);
    const scaffoldedTypeScripts = any.simpleObject();
    const scaffoldedFilesToIgnore = any.listOf(any.string);
    const scaffoldedDirectoriesToIgnore = any.listOf(any.string);
    const documentation = any.simpleObject();
    const projectName = any.word();
    const packageName = any.word();
    const tests = any.simpleObject();
    const eslintConfigs = any.listOf(any.string);
    const buildDirectory = any.string();
    const decisions = any.simpleObject();
    const typeScaffoldingResults = {
      dependencies: scaffoldedTypeDependencies,
      devDependencies: scaffoldedTypeDevDependencies,
      scripts: scaffoldedTypeScripts,
      vcsIgnore: {files: scaffoldedFilesToIgnore, directories: scaffoldedDirectoriesToIgnore},
      documentation,
      eslintConfigs,
      buildDirectory
    };
    applicationChooser.default
      .withArgs({types: applicationTypes, projectType: 'application', decisions})
      .resolves(chosenApplicationType);
    choiceScaffolder.default
      .withArgs(applicationTypes, chosenApplicationType, {projectRoot, projectName, packageName, tests})
      .resolves(typeScaffoldingResults);

    assert.deepEqual(
      await scaffoldApplication({projectRoot, projectName, packageName, applicationTypes, tests, decisions}),
      {
        scripts: {
          clean: `rimraf ./${buildDirectory}`,
          start: `node ./${buildDirectory}/index.js`,
          prebuild: 'run-s clean',
          ...scaffoldedTypeScripts
        },
        dependencies: scaffoldedTypeDependencies,
        devDependencies: [...scaffoldedTypeDevDependencies, 'rimraf'],
        vcsIgnore: {
          files: [...scaffoldedFilesToIgnore, '.env'],
          directories: [...scaffoldedDirectoriesToIgnore, `/${buildDirectory}/`]
        },
        buildDirectory,
        packageProperties: {private: true},
        documentation,
        eslintConfigs,
        nextSteps: []
      }
    );
  });

  test('that missing details do not result in errors', async () => {
    choiceScaffolder.default.resolves({});

    assert.deepEqual(
      await scaffoldApplication({projectRoot, applicationTypes}),
      {
        buildDirectory: 'lib',
        scripts: {clean: 'rimraf ./lib', start: 'node ./lib/index.js', prebuild: 'run-s clean'},
        packageProperties: {private: true},
        dependencies: [],
        devDependencies: ['rimraf'],
        vcsIgnore: {files: ['.env'], directories: ['/lib/']},
        eslintConfigs: [],
        nextSteps: []
      }
    );
  });

  test('that build details are not included when the project will not be transpiled', async () => {
    assert.deepEqual(
      await scaffoldApplication({projectRoot, applicationTypes, transpileLint: false}),
      {
        scripts: {},
        dependencies: [],
        devDependencies: [],
        vcsIgnore: {files: [], directories: []},
        eslintConfigs: [],
        nextSteps: []
      }
    );
  });
});
