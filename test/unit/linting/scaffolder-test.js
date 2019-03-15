import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as scaffoldEslint from '../../../src/linting/eslint';
import scaffold from '../../../src/linting';

suite('linting scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(scaffoldEslint, 'default');
  });

  teardown(() => sandbox.restore());

  test('that linters are configured', async () => {
    const eslintDevDependencies = any.listOf(any.string);
    const eslintFilesIgnoredFromVcs = any.listOf(any.string);
    const projectRoot = any.string();
    const unitTested = any.boolean();
    const configForEslint = any.simpleObject();
    scaffoldEslint.default
      .withArgs({projectRoot, unitTested, config: configForEslint})
      .resolves({devDependencies: eslintDevDependencies, vcsIgnore: {files: eslintFilesIgnoredFromVcs}});

    const result = await scaffold({projectRoot, tests: {unit: unitTested}, configs: {eslint: configForEslint}});

    assert.deepEqual(result.devDependencies, eslintDevDependencies);
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
  });
});
