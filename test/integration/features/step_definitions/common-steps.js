import {EOL} from 'os';
import {readFile} from 'mz/fs';
import {existsSync} from 'fs';
import {resolve} from 'path';
import {After, Before, Given, setWorldConstructor, Then, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import bddStdIn from 'bdd-stdin';
import sinon from 'sinon';
import {assert} from 'chai';
import {World} from '../support/world';
import {scaffold} from '../../../../src';

setWorldConstructor(World);

let scaffoldResult;

async function assertThatPackageDetailsAreConfiguredCorrectlyFor(projectType) {
  const packageDetails = JSON.parse(await readFile(`${process.cwd()}/package.json`));

  if ('application' === projectType) {
    assert.isTrue(packageDetails.private);
    assert.isUndefined(packageDetails.files);
  } else {
    assert.isUndefined(packageDetails.private);
  }

  if ('package' === projectType) {
    assert.equal(packageDetails.main, 'lib/index.cjs.js');
    assert.equal(packageDetails.module, 'lib/index.es.js');
    assert.deepEqual(packageDetails.files, ['lib/']);
  } else {
    assert.isUndefined(packageDetails.main);
    assert.isUndefined(packageDetails.module);
  }

  if ('cli' === projectType) {
    assert.deepEqual(packageDetails.bin, {});
    assert.deepEqual(packageDetails.files, ['bin/']);
  } else {
    assert.isUndefined(packageDetails.bin);
  }
}

async function assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(projectType) {
  const npmConfigDetails = (await readFile(`${process.cwd()}/.npmrc`)).toString().split(EOL);

  assert.include(npmConfigDetails, 'update-notifier=false');

  if ('application' === projectType || 'cli' === projectType) assert.include(npmConfigDetails, 'save-exact=true');
  else assert.notInclude(npmConfigDetails, 'save-exact=true');
}

Before(async function () {
  // work around for overly aggressive mock-fs, see:
  // https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
  require('mock-stdin'); // eslint-disable-line import/no-extraneous-dependencies

  stubbedFs({
    templates: {
      'rollup.config.js': await readFile(resolve(__dirname, '../../../../', 'templates/rollup.config.js')),
      'canary-test.txt': await readFile(resolve(__dirname, '../../../../', 'templates/canary-test.txt')),
      'mocha-setup.txt': await readFile(resolve(__dirname, '../../../../', 'templates/mocha-setup.txt')),
      'cucumber.txt': await readFile(resolve(__dirname, '../../../../', 'templates/cucumber.txt'))
    }
  });

  this.sinonSandbox = sinon.createSandbox();
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
  const visibility = any.fromList(['Public', 'Private']);

  bddStdIn(...[
    '\n',
    ...this.projectTypeAnswer,
    ...'Public' === visibility ? ['\n'] : [],
    '\n',
    '\n',
    '\n',
    '\n',
    ...this.unitTestAnswer,
    ...this.integrationTestAnswer,
    ...this.ciAnswer ? this.ciAnswer : [],
    ...'application' === this.projectType ? ['\n'] : [],
    ...this.transpilationLintAnswer ? this.transpilationLintAnswer : []
  ]);

  scaffoldResult = await scaffold({
    projectRoot: process.cwd(),
    projectName: any.word(),
    visibility,
    license: any.string(),
    vcs: this.vcs,
    configs: {
      eslint: {prefix: any.word(), packageName: any.word()},
      babelPreset: {name: any.word(), packageName: any.word()}
    },
    ciServices: {[any.word()]: {scaffolder: foo => ({foo}), public: true}}
  });
});

Then('the expected files for a(n) {string} are generated', async function (projectType) {
  const nvmRc = await readFile(`${process.cwd()}/.nvmrc`);

  assert.equal(nvmRc.toString(), this.latestLtsVersion);
  assert.isTrue(existsSync(`${process.cwd()}/.eslintrc.yml`));
  assert.isTrue(existsSync(`${process.cwd()}/.babelrc`));

  await assertThatPackageDetailsAreConfiguredCorrectlyFor(projectType);
  await assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(projectType);
});

Then('the expected results for a(n) {string} are returned to the project scaffolder', async function (projectType) {
  assert.containsAllKeys(scaffoldResult.badges.contribution, ['commit-convention', 'commitizen']);

  assert.include(scaffoldResult.vcsIgnore.directories, '/node_modules/');
  assert.include(scaffoldResult.vcsIgnore.directories, '/lib/');
  if ('application' === projectType) assert.include(scaffoldResult.vcsIgnore.files, '.env');
  else assert.notInclude(scaffoldResult.vcsIgnore.files, '.env');
});
