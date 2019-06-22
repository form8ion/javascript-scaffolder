import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as applicationChooser from '../../../src/project-type/prompt';
import * as choiceScaffolder from '../../../src/project-type/choice-scaffolder';
import scaffoldApplication from '../../../src/project-type/application';

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
    const typeScaffoldingResults = {
      ...any.simpleObject(),
      dependencies: scaffoldedTypeDependencies,
      devDependencies: scaffoldedTypeDevDependencies,
      scripts: scaffoldedTypeScripts,
      vcsIgnore: {files: scaffoldedFilesToIgnore, directories: scaffoldedDirectoriesToIgnore}
    };
    applicationChooser.default.withArgs({types: applicationTypes}).resolves(chosenApplicationType);
    choiceScaffolder.default
      .withArgs(applicationTypes, chosenApplicationType, {projectRoot})
      .resolves(typeScaffoldingResults);

    assert.deepEqual(
      await scaffoldApplication({projectRoot, applicationTypes}),
      {
        scripts: {clean: 'rimraf ./lib', start: './lib/index.js', prebuild: 'run-s clean', ...scaffoldedTypeScripts},
        dependencies: scaffoldedTypeDependencies,
        devDependencies: ['rimraf', ...scaffoldedTypeDevDependencies],
        vcsIgnore: {
          files: [...scaffoldedFilesToIgnore, '.env'],
          directories: [...scaffoldedDirectoriesToIgnore, '/lib/']
        },
        buildDirectory: 'lib',
        packageProperties: {private: true}
      }
    );
  });

  test('that missing details do not result in errors', async () => {
    choiceScaffolder.default.resolves({});

    assert.deepEqual(
      await scaffoldApplication({projectRoot, applicationTypes}),
      {
        buildDirectory: 'lib',
        scripts: {clean: 'rimraf ./lib', start: './lib/index.js', prebuild: 'run-s clean'},
        packageProperties: {private: true},
        dependencies: [],
        devDependencies: ['rimraf'],
        vcsIgnore: {files: ['.env'], directories: ['/lib/']}
      }
    );
  });

  test('that build details are not included when the project will not be transpiled', async () => {
    assert.deepEqual(
      await scaffoldApplication({projectRoot, applicationTypes, transpileLint: false}),
      {scripts: {}, dependencies: [], devDependencies: [], vcsIgnore: {files: [], directories: []}}
    );
  });
});
