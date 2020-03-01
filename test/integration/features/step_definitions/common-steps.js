import {EOL} from 'os';
import {existsSync, promises as fsPromises} from 'fs';
import {resolve} from 'path';
import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {After, Before, Given, setWorldConstructor, Then, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import {World} from '../support/world';
import {
  assertThatNpmConfigDetailsAreConfiguredCorrectlyFor,
  assertThatPackageDetailsAreConfiguredCorrectlyFor
} from './npm-steps';
import * as execa from '../../../../third-party-wrappers/execa';
import {scaffold, questionNames} from '../../../../src';
import {
  assertThatDocumentationIsDefinedAppropriately,
  assertThatDocumentationResultsAreReturnedCorrectly
} from './documentation-steps';

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
  stubbedFs({
    templates: {
      'rollup.config.js': await readFile(resolve(__dirname, '../../../../', 'templates/rollup.config.js')),
      'canary-test.txt': await readFile(resolve(__dirname, '../../../../', 'templates/canary-test.txt')),
      'example.mustache': await readFile(resolve(__dirname, '../../../../', 'templates/example.mustache')),
      'mocha-setup.txt': await readFile(resolve(__dirname, '../../../../', 'templates/mocha-setup.txt'))
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
  this.unitTestAnswer = true;
  this.integrationTestAnswer = true;
  this.transpilationLintAnswer = null;
});

Given(/^the project will have "([^"]*)" visibility$/, function (visibility) {
  this.visibility = visibility;
});

When(/^the project is scaffolded$/, async function () {
  const shouldBeScopedAnswer = true;
  this.projectName = any.word();

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
    applicationTypes: {[any.word()]: {scaffolder: foo => ({foo})}},
    decisions: {
      [questionNames.NODE_VERSION_CATEGORY]: 'LTS',
      [questionNames.PROJECT_TYPE]: this.projectType,
      [questionNames.AUTHOR_NAME]: any.word(),
      [questionNames.AUTHOR_EMAIL]: any.email(),
      [questionNames.AUTHOR_URL]: any.url(),
      [commonQuestionNames.UNIT_TESTS]: this.unitTestAnswer,
      [commonQuestionNames.INTEGRATION_TESTS]: this.integrationTestAnswer,
      [commonQuestionNames.CI_SERVICE]: this.ciAnswer || 'Other',
      [questionNames.TRANSPILE_LINT]: this.transpileAndLint,
      [questionNames.PROJECT_TYPE_CHOICE]: 'Other',
      ...['Package', 'CLI'].includes(this.projectType) && {
        [questionNames.SHOULD_BE_SCOPED]: shouldBeScopedAnswer,
        ...shouldBeScopedAnswer && {[questionNames.SCOPE]: this.npmAccount}
      }
    }
  });
});

Then('the expected files for a(n) {string} are generated', async function (projectType) {
  const nvmRc = await readFile(`${process.cwd()}/.nvmrc`);

  assert.equal(nvmRc.toString(), `v${this.latestLtsMajorVersion}`);
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
  assert.containsAllKeys(
    scaffoldResult.badges.contribution,
    [
      'commit-convention',
      'commitizen',
      ...this.vcs && 'Public' === this.visibility ? ['greenkeeper'] : [],
      ...['Package', 'CLI'].includes(this.projectType) ? ['semantic-release'] : []
    ]
  );

  assertThatProperDirectoriesAreIgnoredFromVersionControl(projectType);
  assertThatProperFilesAreIgnoredFromVersionControl(projectType);
  assertThatDocumentationResultsAreReturnedCorrectly(
    projectType,
    this.npmAccount,
    this.projectName,
    this.visibility,
    scaffoldResult
  );
});
