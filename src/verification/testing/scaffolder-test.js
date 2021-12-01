import * as javascript from '@form8ion/javascript';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import scaffoldTesting from './scaffolder';

suite('testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const visibility = any.word();
  const dialect = any.word();
  const unitTestingDevDependencies = any.listOf(any.string);
  const unitTestingEslintConfigs = any.listOf(any.string);
  const unitTestNextSteps = any.listOf(any.simpleObject);
  const unitTestScripts = any.simpleObject();
  const unitTestFilesToIgnoreFromVcs = any.listOf(any.string);
  const unitTestDirectoriesToIgnoreFromVcs = any.listOf(any.string);
  const vcs = any.simpleObject();
  const unitTestFrameworks = any.simpleObject();
  const decisions = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(javascript, 'scaffoldUnitTesting');

    javascript.scaffoldUnitTesting
      .withArgs({projectRoot, visibility, vcs, frameworks: unitTestFrameworks, decisions, dialect})
      .resolves({
        devDependencies: unitTestingDevDependencies,
        scripts: unitTestScripts,
        vcsIgnore: {files: unitTestFilesToIgnoreFromVcs, directories: unitTestDirectoriesToIgnoreFromVcs},
        eslintConfigs: unitTestingEslintConfigs,
        nextSteps: unitTestNextSteps
      });
  });

  teardown(() => sandbox.restore());

  test('that unit testing is scaffolded if the project will be unit tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({
        projectRoot,
        visibility,
        tests: {unit: true},
        vcs,
        unitTestFrameworks,
        decisions,
        dialect
      }),
      {
        devDependencies: ['@travi/any', ...unitTestingDevDependencies],
        scripts: unitTestScripts,
        vcsIgnore: {files: unitTestFilesToIgnoreFromVcs, directories: unitTestDirectoriesToIgnoreFromVcs},
        eslintConfigs: unitTestingEslintConfigs,
        nextSteps: unitTestNextSteps
      }
    );
  });

  test('that unit testing is not scaffolded if the project will not be unit tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: false, integration: true}}),
      {devDependencies: ['@travi/any']}
    );
  });

  test('that testing is not scaffolded if the project will not be tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: false, integration: false}}),
      {devDependencies: []}
    );
  });
});
