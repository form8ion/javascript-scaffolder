import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as scaffoldEslint from '../../../src/linting/eslint';
import * as scaffoldRemark from '../../../src/linting/remark';
import * as scaffoldBanSensitiveFiles from '../../../src/linting/ban-sensitive-files';
import scaffold from '../../../src/linting';

suite('linting scaffolder', () => {
  let sandbox;
  const eslintDevDependencies = any.listOf(any.string);
  const eslintFilesIgnoredFromVcs = any.listOf(any.string);
  const banSensitiveFilesDevDependencies = any.listOf(any.string);
  const banSensitiveFilesScripts = any.simpleObject();
  const projectRoot = any.string();
  const unitTested = any.boolean();
  const configForEslint = any.simpleObject();
  const eslintScripts = any.simpleObject();
  const vcs = any.simpleObject();
  const remarkDevDependencies = any.listOf(any.string);
  const remarkScripts = any.simpleObject();
  const configForRemark = any.simpleObject();
  const buildDirectory = any.string();
  const eslintConfigs = any.listOf(any.word);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(scaffoldEslint, 'default');
    sandbox.stub(scaffoldRemark, 'default');
    sandbox.stub(scaffoldBanSensitiveFiles, 'default');

    scaffoldRemark.default
      .withArgs({projectRoot, config: configForRemark, vcs})
      .resolves({devDependencies: remarkDevDependencies, scripts: remarkScripts});
    scaffoldEslint.default
      .withArgs({projectRoot, unitTested, config: configForEslint, buildDirectory, additionalConfigs: eslintConfigs})
      .resolves({
        devDependencies: eslintDevDependencies,
        vcsIgnore: {files: eslintFilesIgnoredFromVcs},
        scripts: eslintScripts
      });
    scaffoldBanSensitiveFiles.default
      .resolves({devDependencies: banSensitiveFilesDevDependencies, scripts: banSensitiveFilesScripts});
  });

  teardown(() => sandbox.restore());

  test('that linters are configured when config definitions are provided', async () => {
    const result = await scaffold({
      projectRoot,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs,
      buildDirectory,
      eslintConfigs
    });

    assert.deepEqual(
      result.devDependencies,
      [...eslintDevDependencies, ...remarkDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(result.scripts, {...eslintScripts, ...remarkScripts, ...banSensitiveFilesScripts});
  });

  test('that eslint is not scaffolded when a config is not defined', async () => {
    const result = await scaffold({
      projectRoot,
      tests: {unit: unitTested},
      configs: {remark: configForRemark},
      vcs
    });

    assert.deepEqual(
      result.devDependencies,
      [...remarkDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.vcsIgnore.files, []);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(result.scripts, {...remarkScripts, ...banSensitiveFilesScripts});
  });

  test('that eslint is not scaffolded when `transpileLint` is false', async () => {
    const result = await scaffold({
      projectRoot,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs,
      transpileLint: false
    });

    assert.deepEqual(
      result.devDependencies,
      [...remarkDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.vcsIgnore.files, []);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(result.scripts, {...remarkScripts, ...banSensitiveFilesScripts});
  });

  test('that remark is not scaffolded when a config is not defined', async () => {
    const result = await scaffold({
      projectRoot,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint},
      vcs,
      buildDirectory,
      eslintConfigs
    });

    assert.notCalled(scaffoldRemark.default);
    assert.deepEqual(result.devDependencies, [...eslintDevDependencies, ...banSensitiveFilesDevDependencies]);
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(result.scripts, {...eslintScripts, ...banSensitiveFilesScripts});
  });

  test('that ban-sensitive-files is not scaffolded when the project will not be versioned', async () => {
    scaffoldRemark.default
      .withArgs({projectRoot, config: configForRemark, vcs: undefined})
      .resolves({devDependencies: remarkDevDependencies, scripts: remarkScripts});

    const result = await scaffold({
      projectRoot,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs: undefined,
      buildDirectory,
      eslintConfigs
    });

    assert.deepEqual(result.devDependencies, [...eslintDevDependencies, ...remarkDevDependencies]);
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(result.scripts, {...eslintScripts, ...remarkScripts});
  });
});
