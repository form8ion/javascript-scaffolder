import deepmerge from 'deepmerge';
import * as huskyScaffolder from '@form8ion/husky';

import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';

import * as testingScaffolder from './testing/scaffolder';
import * as lintingScaffolder from './linting/scaffolder';
import {scaffoldVerification} from './verifier';

suite('verification', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(testingScaffolder, 'default');
    sandbox.stub(lintingScaffolder, 'default');
    sandbox.stub(huskyScaffolder, 'scaffold');
    sandbox.stub(deepmerge, 'all');
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
    const huskyResults = any.simpleObject();
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
    const mergedEslintResults = any.simpleObject();
    const mergedResults = any.simpleObject();
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
        eslint: mergedEslintResults
      })
      .resolves(lintingResults);
    testingScaffolder.default
      .withArgs({projectRoot, tests, visibility, vcs, unitTestFrameworks, decisions, dialect})
      .resolves(testingResults);
    huskyScaffolder.scaffold.withArgs({projectRoot, packageManager}).resolves(huskyResults);
    deepmerge.all
      .withArgs([testingEslintResults, {configs: testingResultsEslintConfigs}, {configs: eslintConfigs}])
      .returns(mergedEslintResults);
    deepmerge.all.withArgs([testingResults, lintingResults, huskyResults]).returns(mergedResults);

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
      mergedResults
    );
  });
});
