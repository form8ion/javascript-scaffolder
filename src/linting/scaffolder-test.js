import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as scaffoldEslint from './eslint';
import * as scaffoldRemark from './remark';
import * as scaffoldBanSensitiveFiles from './ban-sensitive-files';
import scaffold from './index';

suite('linting scaffolder', () => {
  let sandbox;
  const eslintDevDependencies = any.listOf(any.string);
  const eslintFilesIgnoredFromVcs = any.listOf(any.string);
  const banSensitiveFilesDevDependencies = any.listOf(any.string);
  const banSensitiveFilesScripts = any.simpleObject();
  const projectRoot = any.string();
  const projectType = any.word();
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
      .withArgs({projectRoot, projectType, config: configForRemark, vcs})
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
      projectType,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs,
      buildDirectory,
      eslintConfigs
    });

    assert.deepEqual(
      result.devDependencies,
      ['lockfile-lint', ...eslintDevDependencies, ...remarkDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(
      result.scripts,
      {
        'lint:lockfile': 'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm',
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
      tests: {unit: unitTested},
      configs: {remark: configForRemark},
      vcs
    });

    assert.deepEqual(
      result.devDependencies,
      ['lockfile-lint', ...remarkDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.vcsIgnore.files, []);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(
      result.scripts,
      {
        'lint:lockfile': 'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm',
        ...remarkScripts,
        ...banSensitiveFilesScripts
      }
    );
  });

  test('that eslint is not scaffolded when `transpileLint` is false', async () => {
    const result = await scaffold({
      projectRoot,
      projectType,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs,
      transpileLint: false
    });

    assert.deepEqual(
      result.devDependencies,
      ['lockfile-lint', ...remarkDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.vcsIgnore.files, []);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(
      result.scripts,
      {
        'lint:lockfile': 'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm',
        ...remarkScripts,
        ...banSensitiveFilesScripts
      }
    );
  });

  test('that remark  defaults to the form8ion config when a config is not defined', async () => {
    const result = await scaffold({
      projectRoot,
      projectType,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint},
      vcs,
      buildDirectory,
      eslintConfigs
    });

    assert.calledWith(scaffoldRemark.default, {projectRoot, projectType, vcs, config: '@form8ion/remark-lint-preset'});
    assert.deepEqual(
      result.devDependencies,
      ['lockfile-lint', ...eslintDevDependencies, ...banSensitiveFilesDevDependencies]
    );
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(
      result.scripts,
      {
        'lint:lockfile': 'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm',
        ...eslintScripts,
        ...banSensitiveFilesScripts
      }
    );
  });

  test('that ban-sensitive-files is not scaffolded when the project will not be versioned', async () => {
    scaffoldRemark.default
      .withArgs({projectRoot, projectType, config: configForRemark, vcs: undefined})
      .resolves({devDependencies: remarkDevDependencies, scripts: remarkScripts});

    const result = await scaffold({
      projectRoot,
      projectType,
      tests: {unit: unitTested},
      configs: {eslint: configForEslint, remark: configForRemark},
      vcs: undefined,
      buildDirectory,
      eslintConfigs
    });

    assert.deepEqual(result.devDependencies, ['lockfile-lint', ...eslintDevDependencies, ...remarkDevDependencies]);
    assert.deepEqual(result.vcsIgnore.files, eslintFilesIgnoredFromVcs);
    assert.deepEqual(result.vcsIgnore.directories, []);
    assert.deepEqual(
      result.scripts,
      {
        'lint:lockfile': 'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm',
        ...eslintScripts,
        ...remarkScripts
      }
    );
  });
});
