import {EOL} from 'os';
import {existsSync, promises as fsPromises} from 'fs';
import {resolve} from 'path';
import {After, Before, Given, setWorldConstructor, Then, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import bddStdIn from 'bdd-stdin';
import sinon from 'sinon';
import {assert} from 'chai';
import {World} from '../support/world';
import {
  assertThatNpmConfigDetailsAreConfiguredCorrectlyFor,
  assertThatPackageDetailsAreConfiguredCorrectlyFor
} from './npm-steps';
import * as execa from '../../../../third-party-wrappers/execa';
import {scaffold} from '../../../../src';

const {readFile} = fsPromises;

setWorldConstructor(World);

let scaffoldResult;

async function assertThatProperDirectoriesAreIgnoredFromEslint(projectType, transpileAndLint) {
  if (transpileAndLint) {
    const eslintIgnoreDetails = (await readFile(`${process.cwd()}/.eslintignore`)).toString().split(EOL);

    if ('cli' === projectType) {
      assert.include(eslintIgnoreDetails, '/bin/');
      assert.notInclude(eslintIgnoreDetails, '/lib/');
    } else {
      assert.include(eslintIgnoreDetails, '/lib/');
      assert.notInclude(eslintIgnoreDetails, '/bin/');
    }
  } else assert.isFalse(existsSync(`${process.cwd()}/.eslintrc.yml`));
}

function assertThatProperDirectoriesAreIgnoredFromVersionControl(projectType) {
  assert.include(scaffoldResult.vcsIgnore.directories, '/node_modules/');
  if ('cli' === projectType) {
    assert.include(scaffoldResult.vcsIgnore.directories, '/bin/');
    assert.notInclude(scaffoldResult.vcsIgnore.directories, '/lib/');
  } else {
    assert.include(scaffoldResult.vcsIgnore.directories, '/lib/');
    assert.notInclude(scaffoldResult.vcsIgnore.directories, '/bin/');
  }
}

function assertThatProperFilesAreIgnoredFromVersionControl(projectType) {
  if ('application' === projectType) {
    assert.include(scaffoldResult.vcsIgnore.files, '.env');
  } else {
    assert.notInclude(scaffoldResult.vcsIgnore.files, '.env');
  }
}

Before(async function () {
  // work around for overly aggressive mock-fs, see:
  // https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
  require('mock-stdin'); // eslint-disable-line import/no-extraneous-dependencies

  stubbedFs({
    templates: {
      'rollup.config.js': await readFile(resolve(__dirname, '../../../../', 'templates/rollup.config.js')),
      'canary-test.txt': await readFile(resolve(__dirname, '../../../../', 'templates/canary-test.txt')),
      'mocha-setup.txt': await readFile(resolve(__dirname, '../../../../', 'templates/mocha-setup.txt'))
    },
    node_modules: {
      '@form8ion': {
        'cucumber-scaffolder': {
          templates: {
            'cucumber.txt': await readFile(
              resolve(__dirname, '../../../../', 'node_modules/@form8ion/cucumber-scaffolder/templates/cucumber.txt')
            )
          }
        }
      }
    }
  });

  this.sinonSandbox = sinon.createSandbox();
  this.sinonSandbox.stub(execa, 'default');

  this.transpileAndLint = true;
  this.tested = true;
  this.visibility = any.fromList(['Public', 'Private']);
});

After(function () {
  stubbedFs.restore();
  this.sinonSandbox.restore();
});

Given(/^the default answers are chosen$/, async function () {
  this.unitTestAnswer = ['\n'];
  this.integrationTestAnswer = ['\n'];
  this.transpilationLintAnswer = null;
});

When(/^the project is scaffolded$/, async function () {
  const shouldBeScopedAnswer = 'Public' === this.visibility ? ['\n'] : [];
  this.projectName = any.word();

  bddStdIn(...[
    '\n',
    ...this.projectTypeAnswer,
    ...shouldBeScopedAnswer,
    '\n',
    '\n',
    '\n',
    '\n',
    ...this.unitTestAnswer,
    ...this.integrationTestAnswer,
    ...this.ciAnswer ? this.ciAnswer : [],
    ...'application' === this.projectType ? this.applicationTypeAnswer : [],
    ...this.transpilationLintAnswer ? this.transpilationLintAnswer : []
  ]);

  scaffoldResult = await scaffold({
    projectRoot: process.cwd(),
    projectName: this.projectName,
    visibility: this.visibility,
    license: any.string(),
    vcs: this.vcs,
    configs: {
      eslint: {scope: `@${any.word()}`},
      babelPreset: {name: any.word(), packageName: any.word()}
    },
    ciServices: {[any.word()]: {scaffolder: foo => ({foo}), public: true}},
    applicationTypes: {[any.word()]: {scaffolder: foo => ({foo})}}
  });
});

Then('the expected files for a(n) {string} are generated', async function (projectType) {
  const nvmRc = await readFile(`${process.cwd()}/.nvmrc`);

  assert.equal(nvmRc.toString(), `v${this.latestLtsMajorVersion}`);
  assert.equal(existsSync(`${process.cwd()}/.babelrc`), this.transpileAndLint);

  await assertThatProperDirectoriesAreIgnoredFromEslint(projectType, this.transpileAndLint);
  await assertThatPackageDetailsAreConfiguredCorrectlyFor({
    projectType,
    visibility: this.visibility,
    tested: this.tested,
    transpileAndLint: this.transpileAndLint,
    projectName: this.projectName,
    npmAccount: this.npmAccount
  });
  await assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(projectType);
});

Then('the expected results for a(n) {string} are returned to the project scaffolder', async function (projectType) {
  assert.containsAllKeys(scaffoldResult.badges.contribution, ['commit-convention', 'commitizen']);

  assertThatProperDirectoriesAreIgnoredFromVersionControl(projectType);
  assertThatProperFilesAreIgnoredFromVersionControl(projectType);
});
