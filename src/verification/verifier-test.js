import deepmerge from 'deepmerge';

import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';

import * as testingScaffolder from '../testing/scaffolder';
import * as lintingScaffolder from '../linting/scaffolder';
import {scaffoldVerification} from './verifier';

suite('verification', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(testingScaffolder, 'default');
    sandbox.stub(lintingScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that that linting and testing are scaffolded', async () => {
    const projectRoot = any.string();
    const visibility = any.string();
    const projectType = any.string();
    const packageManager = any.string();
    const buildDirectory = any.string();
    const dialect = any.word();
    const vcs = any.simpleObject();
    const tests = any.simpleObject();
    const unitTestFrameworks = any.simpleObject();
    const decisions = any.simpleObject();
    const lintingResults = any.simpleObject();
    const testingEslintResults = any.simpleObject();
    const testingResultsEslintConfigs = any.simpleObject();
    const testingResults = {
      ...any.simpleObject(),
      eslint: testingEslintResults,
      eslintConfigs: testingResultsEslintConfigs
    };
    const configs = any.simpleObject();
    const registries = any.simpleObject();
    const eslintConfigs = any.simpleObject();
    const configureLinting = any.boolean();
    lintingScaffolder.default
      .withArgs({
        projectRoot,
        vcs,
        dialect,
        projectType,
        packageManager,
        configs,
        registries,
        configureLinting,
        buildDirectory,
        eslint: deepmerge.all([testingEslintResults, {configs: testingResultsEslintConfigs}, {configs: eslintConfigs}])
      })
      .resolves(lintingResults);
    testingScaffolder.default
      .withArgs({projectRoot, tests, visibility, vcs, unitTestFrameworks, decisions, dialect})
      .resolves(testingResults);

    assert.deepEqual(
      await scaffoldVerification({
        projectRoot,
        vcs,
        dialect,
        tests,
        visibility,
        decisions,
        unitTestFrameworks,
        projectType,
        packageManager,
        configs,
        registries,
        configureLinting,
        buildDirectory,
        eslintConfigs
      }),
      deepmerge(lintingResults, testingResults)
    );
  });
});
