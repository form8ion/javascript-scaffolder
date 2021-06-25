import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as scaffoldEslint from './eslint';
import * as scaffoldRemark from './remark';
import * as scaffoldBanSensitiveFiles from './ban-sensitive-files';
import * as scaffoldLockfileLint from './lockfile';
import scaffold from './index';

suite('linting scaffolder', () => {
  let sandbox;
  const eslintDevDependencies = any.listOf(any.string);
  const eslintFilesIgnoredFromVcs = any.listOf(any.string);
  const banSensitiveFilesDevDependencies = any.listOf(any.string);
  const banSensitiveFilesScripts = any.simpleObject();
  const lockfileDevDependencies = any.listOf(any.string);
  const lockfileScripts = any.simpleObject();
  const projectRoot = any.string();
  const projectType = any.word();
  const packageManager = any.word();
  const configForEslint = any.simpleObject();
  const eslintScripts = any.simpleObject();
  const vcs = any.simpleObject();
  const remarkDevDependencies = any.listOf(any.string);
  const remarkScripts = any.simpleObject();
  const configForRemark = any.simpleObject();
  const registries = any.simpleObject();
  const buildDirectory = any.string();
  const eslintConfigs = any.listOf(any.word);
  const transpileLint = true;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(scaffoldEslint, 'default');
    sandbox.stub(scaffoldRemark, 'default');
    sandbox.stub(scaffoldBanSensitiveFiles, 'default');
    sandbox.stub(scaffoldLockfileLint, 'default');

    scaffoldRemark.default
      .withArgs({projectRoot, projectType, config: configForRemark, vcs, transpileLint})
      .resolves({devDependencies: remarkDevDependencies, scripts: remarkScripts});
    scaffoldEslint.default
      .withArgs({
        projectRoot,
        config: configForEslint,
        buildDirectory,
        additionalConfiguration: {configs: eslintConfigs}
      })
      .resolves({
        devDependencies: eslintDevDependencies,
        vcsIgnore: {files: eslintFilesIgnoredFromVcs},
        scripts: eslintScripts
      });
    scaffoldBanSensitiveFiles.default
      .resolves({devDependencies: banSensitiveFilesDevDependencies, scripts: banSensitiveFilesScripts});
    scaffoldLockfileLint.default
      .withArgs({projectRoot, packageManager, registries})
      .resolves({devDependencies: lockfileDevDependencies, scripts: lockfileScripts});
  });

  teardown(() => sandbox.restore());

  test('that linters are configured when config definitions are provided', async () => {
    const result = await scaffold({
      projectRoot,
      projectType,
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs,
      buildDirectory,
      eslint: {configs: eslintConfigs},
      transpileLint,
      packageManager,
      registries
    });

    assert.deepEqual(
      result.devDependencies,
      [
        ...lockfileDevDependencies,
        ...eslintDevDependencies,
        ...remarkDevDependencies,
        ...banSensitiveFilesDevDependencies
      ]
    );
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(
      result.scripts,
      {
        ...lockfileScripts,
        ...eslintScripts,
        ...remarkScripts,
        ...banSensitiveFilesScripts
      }
    );
  });

  test('that eslint is not scaffolded when a config is not defined', async () => {
    const result = await scaffold({
      projectRoot,
      projectType,
      configs: {remark: configForRemark},
      vcs,
      transpileLint,
      packageManager,
      registries
    });

    assert.deepEqual(
      result.devDependencies,
      [...lockfileDevDependencies, ...remarkDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.scripts, {...lockfileScripts, ...remarkScripts, ...banSensitiveFilesScripts});
  });

  test('that eslint is not scaffolded when `transpileLint` is false', async () => {
    scaffoldRemark.default
      .withArgs({projectRoot, projectType, config: configForRemark, vcs, transpileLint: false})
      .resolves({devDependencies: remarkDevDependencies, scripts: remarkScripts});

    const result = await scaffold({
      projectRoot,
      projectType,
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs,
      transpileLint: false,
      packageManager,
      registries
    });

    assert.deepEqual(
      result.devDependencies,
      [...lockfileDevDependencies, ...remarkDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.scripts, {...lockfileScripts, ...remarkScripts, ...banSensitiveFilesScripts});
  });

  test('that remark defaults to the form8ion config when a config is not defined', async () => {
    scaffoldRemark.default
      .withArgs({projectRoot, projectType, vcs, transpileLint, config: '@form8ion/remark-lint-preset'})
      .resolves({devDependencies: remarkDevDependencies, scripts: remarkScripts});

    const result = await scaffold({
      projectRoot,
      projectType,
      configs: {eslint: configForEslint},
      vcs,
      buildDirectory,
      eslint: {configs: eslintConfigs},
      transpileLint,
      packageManager,
      registries
    });

    assert.deepEqual(
      result.devDependencies,
      [
        ...lockfileDevDependencies,
        ...eslintDevDependencies,
        ...remarkDevDependencies,
        ...banSensitiveFilesDevDependencies
      ]
    );
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(
      result.scripts,
      {
        ...lockfileScripts,
        ...eslintScripts,
        ...remarkScripts,
        ...banSensitiveFilesScripts
      }
    );
  });

  test('that ban-sensitive-files is not scaffolded when the project will not be versioned', async () => {
    scaffoldRemark.default
      .withArgs({projectRoot, projectType, config: configForRemark, vcs: undefined, transpileLint})
      .resolves({devDependencies: remarkDevDependencies, scripts: remarkScripts});

    const result = await scaffold({
      projectRoot,
      projectType,
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs: undefined,
      buildDirectory,
      eslint: {configs: eslintConfigs},
      transpileLint,
      packageManager,
      registries
    });

    assert.deepEqual(
      result.devDependencies,
      [...lockfileDevDependencies, ...eslintDevDependencies, ...remarkDevDependencies]
    );
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(result.scripts, {...lockfileScripts, ...eslintScripts, ...remarkScripts});
  });
});
