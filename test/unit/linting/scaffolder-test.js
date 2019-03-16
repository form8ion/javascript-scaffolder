import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as scaffoldEslint from '../../../src/linting/eslint';
import * as scaffoldRemark from '../../../src/linting/remark';
import scaffold from '../../../src/linting';

suite('linting scaffolder', () => {
  let sandbox;
  const eslintDevDependencies = any.listOf(any.string);
  const eslintFilesIgnoredFromVcs = any.listOf(any.string);
  const projectRoot = any.string();
  const unitTested = any.boolean();
  const configForEslint = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(scaffoldEslint, 'default');
    sandbox.stub(scaffoldRemark, 'default');
  });

  teardown(() => sandbox.restore());

  test('that linters are configured when config definitions are provided', async () => {
    const remarkDevDependencies = any.listOf(any.string);
    const configForRemark = any.simpleObject();
    scaffoldEslint.default
      .withArgs({projectRoot, unitTested, config: configForEslint})
      .resolves({devDependencies: eslintDevDependencies, vcsIgnore: {files: eslintFilesIgnoredFromVcs}});
    scaffoldRemark.default
      .withArgs({projectRoot, config: configForRemark})
      .resolves({devDependencies: remarkDevDependencies});

    const result = await scaffold({
      projectRoot,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint, remark: configForRemark}
    });

    assert.deepEqual(result.devDependencies, [...eslintDevDependencies, ...remarkDevDependencies]);
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
  });

  test('that remark is not scaffolded when a config is not defined', async () => {
    scaffoldEslint.default
      .withArgs({projectRoot, unitTested, config: configForEslint})
      .resolves({devDependencies: eslintDevDependencies, vcsIgnore: {files: eslintFilesIgnoredFromVcs}});

    const result = await scaffold({projectRoot, tests: {unit: unitTested}, configs: {eslint: configForEslint}});

    assert.notCalled(scaffoldRemark.default);
    assert.deepEqual(result.devDependencies, eslintDevDependencies);
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
  });
});
