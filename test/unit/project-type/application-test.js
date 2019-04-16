import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as applicationChooser from '../../../src/project-type/prompt';
import * as choiceScaffolder from '../../../src/project-type/choice-scaffolder';
import scaffoldApplication from '../../../src/project-type/application';

suite('application project-type', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(applicationChooser, 'default');
    sandbox.stub(choiceScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that details specific to an application project-type are scaffolded', async () => {
    const applicationTypes = any.simpleObject();
    const configs = any.simpleObject();
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
      .withArgs(applicationTypes, chosenApplicationType, {projectRoot, configs})
      .resolves(typeScaffoldingResults);

    assert.deepEqual(
      await scaffoldApplication({projectRoot, applicationTypes, configs}),
      {
        scripts: {clean: 'rimraf ./lib', start: './lib/index.js', prebuild: 'run-s clean', ...scaffoldedTypeScripts},
        dependencies: scaffoldedTypeDependencies,
        devDependencies: ['rimraf', ...scaffoldedTypeDevDependencies],
        vcsIgnore: {files: scaffoldedFilesToIgnore, directories: [...scaffoldedDirectoriesToIgnore, '/lib/']},
        buildDirectory: './lib'
      }
    );
  });
});
