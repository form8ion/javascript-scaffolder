import {existsSync, promises as fs} from 'fs';
import {resolve} from 'path';
import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {After, Before, Given, setWorldConstructor, Then, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import td from 'testdouble';
import importFresh from 'import-fresh';
import clearModule from 'clear-module';
import {assert} from 'chai';
import {World} from '../support/world';
import {
  assertThatNpmConfigDetailsAreConfiguredCorrectlyFor,
  assertThatPackageDetailsAreConfiguredCorrectlyFor
} from './npm-steps';
import {
  assertThatDocumentationIsDefinedAppropriately,
  assertThatDocumentationResultsAreReturnedCorrectly
} from './documentation-steps';
import {
  assertThatProperDirectoriesAreIgnoredFromVersionControl,
  assertThatProperFilesAreIgnoredFromVersionControl
} from './vcs-steps';
import {assertThatProperDirectoriesAreIgnoredFromEslint} from './config-steps';

const packagePreviewDirectory = '../__package_previews__/javascript-scaffolder';
const stubbedNodeModules = stubbedFs.load(resolve(__dirname, '../../../../', 'node_modules'));

setWorldConstructor(World);

let scaffold, questionNames;

Before(async function () {
  this.execa = td.replace('execa');

  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  ({scaffold, questionNames} = importFresh('@travi/javascript-scaffolder'));

  stubbedFs({
    node_modules: stubbedNodeModules,
    [packagePreviewDirectory]: {
      '@travi': {
        'javascript-scaffolder': {
          templates: {
            'rollup.config.js': await fs.readFile(resolve(__dirname, '../../../../', 'templates/rollup.config.js')),
            'example.mustache': await fs.readFile(resolve(__dirname, '../../../../', 'templates/example.mustache'))
          }
        }
      },
      node_modules: stubbedNodeModules
    }
  });

  this.transpileAndLint = true;
  this.tested = true;
  this.visibility = any.fromList(['Public', 'Private']);
});

After(function () {
  stubbedFs.restore();
  td.reset();
  clearModule('@travi/javascript-scaffolder');
  clearModule('@form8ion/lift-javascript');
  clearModule('@form8ion/javascript-core');
  clearModule('execa');
});

Given(/^the default answers are chosen$/, async function () {
  this.unitTestAnswer = true;
  this.integrationTestAnswer = true;
  this.transpilationLintAnswer = null;
});

Given(/^the project will have "([^"]*)" visibility$/, function (visibility) {
  this.visibility = visibility;
});

When(/^the project is scaffolded$/, async function () {
  const shouldBeScopedAnswer = true;
  this.projectName = `${any.word()}-${any.word()}`;

  this.scaffoldResult = await scaffold({
    projectRoot: process.cwd(),
    projectName: this.projectName,
    visibility: this.visibility,
    license: any.string(),
    vcs: this.vcs,
    configs: {
      eslint: {scope: `@${any.word()}`},
      babelPreset: {name: any.word(), packageName: any.word()},
      commitlint: {name: any.word(), packageName: any.word()}
    },
    ciServices: {[any.word()]: {scaffolder: foo => ({foo}), public: true}},
    applicationTypes: {[any.word()]: {scaffolder: foo => ({foo})}},
    decisions: {
      [questionNames.NODE_VERSION_CATEGORY]: 'LTS',
      [questionNames.PROJECT_TYPE]: this.projectType,
      [questionNames.AUTHOR_NAME]: any.word(),
      [questionNames.AUTHOR_EMAIL]: any.email(),
      [questionNames.AUTHOR_URL]: any.url(),
      [commonQuestionNames.UNIT_TESTS]: this.unitTestAnswer,
      [commonQuestionNames.INTEGRATION_TESTS]: this.integrationTestAnswer,
      ...null !== this.ciAnswer && {[commonQuestionNames.CI_SERVICE]: this.ciAnswer || 'Other'},
      [questionNames.TRANSPILE_LINT]: this.transpileAndLint,
      [questionNames.PROJECT_TYPE_CHOICE]: 'Other',
      [questionNames.HOST]: 'Other',
      ...['Package', 'CLI'].includes(this.projectType) && {
        [questionNames.SHOULD_BE_SCOPED]: shouldBeScopedAnswer,
        ...shouldBeScopedAnswer && {[questionNames.SCOPE]: this.npmAccount}
      },
      ...this.packageManager && {[questionNames.PACKAGE_MANAGER]: this.packageManager}
    },
    unitTestFrameworks: {},
    pathWithinParent: this.pathWithinParent
  });
});

Then('the expected files for a(n) {string} are generated', async function (projectType) {
  assert.equal(existsSync(`${process.cwd()}/.babelrc`), this.transpileAndLint);

  await Promise.all([
    assertThatProperDirectoriesAreIgnoredFromEslint(projectType, this.transpileAndLint),
    assertThatPackageDetailsAreConfiguredCorrectlyFor({
      projectType,
      visibility: this.visibility,
      tested: this.tested,
      transpileAndLint: this.transpileAndLint,
      projectName: this.projectName,
      npmAccount: this.npmAccount
    }),
    assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(projectType),
    assertThatDocumentationIsDefinedAppropriately(projectType, this.projectName, this.transpileAndLint)
  ]);
});

Then('the expected results for a(n) {string} are returned to the project scaffolder', async function (projectType) {
  const {projectTypes} = require('@form8ion/javascript-core');
  const type = 'any' !== projectType ? projectType : this.projectType;

  if ([projectTypes.PACKAGE, projectTypes.CLI].includes(type)) {
    assert.include(Object.keys(this.scaffoldResult.badges.contribution), 'semantic-release');
  }

  assertThatProperDirectoriesAreIgnoredFromVersionControl(this.scaffoldResult, type);
  assertThatProperFilesAreIgnoredFromVersionControl(this.scaffoldResult, type);
  assertThatDocumentationResultsAreReturnedCorrectly(
    type,
    this.npmAccount,
    this.projectName,
    this.visibility,
    this.scaffoldResult,
    this.packageManager
  );
});
