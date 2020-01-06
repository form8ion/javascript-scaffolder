import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as unitTestingScaffolder from './unit';
import scaffoldTesting from './scaffolder';

suite('testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const visibility = any.word();
  const unitTestingDevDependencies = any.listOf(any.string);
  const unitTestingEslintConfigs = any.listOf(any.string);
  const unitTestScripts = any.simpleObject();
  const unitTestFilesToIgnoreFromVcs = any.listOf(any.string);
  const unitTestDirectoriesToIgnoreFromVcs = any.listOf(any.string);
  const vcs = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(unitTestingScaffolder, 'default');

    unitTestingScaffolder.default
      .withArgs({projectRoot, visibility, vcs})
      .resolves({
        ...any.simpleObject(),
        devDependencies: unitTestingDevDependencies,
        scripts: unitTestScripts,
        vcsIgnore: {files: unitTestFilesToIgnoreFromVcs, directories: unitTestDirectoriesToIgnoreFromVcs},
        eslintConfigs: unitTestingEslintConfigs
      });
  });

  teardown(() => sandbox.restore());

  test('that unit testing is scaffolded if the project will be unit tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: true}, vcs}),
      {
        devDependencies: ['@travi/any', ...unitTestingDevDependencies],
        scripts: unitTestScripts,
        vcsIgnore: {files: unitTestFilesToIgnoreFromVcs, directories: unitTestDirectoriesToIgnoreFromVcs},
        eslintConfigs: unitTestingEslintConfigs
      }
    );
  });

  test('that unit testing is not scaffolded if the project will not be unit tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: false, integration: true}}),
      {
        devDependencies: ['@travi/any'],
        scripts: {},
        vcsIgnore: {files: [], directories: []},
        eslintConfigs: []
      }
    );
  });

  test('that testing is not scaffolded if the project will not be tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: false, integration: false}}),
      {
        devDependencies: [],
        scripts: {},
        vcsIgnore: {files: [], directories: []},
        eslintConfigs: []
      }
    );
  });
});
