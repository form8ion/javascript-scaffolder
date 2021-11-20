import {EOL} from 'os';
import {promises as fs, promises} from 'fs';
import {Given, Then} from '@cucumber/cucumber';
import any from '@travi/any';
import {assert} from 'chai';
import td from 'testdouble';

function isNonConsumable(projectType) {
  return 'application' === projectType || 'cli' === projectType;
}

function assertThatPackageSpecificDetailsAreDefinedCorrectly(
  packageDetails,
  npmAccount,
  projectName,
  dialect,
  visibility
) {
  const {dialects} = require('@form8ion/javascript-core');

  assert.equal(packageDetails.name, `@${npmAccount}/${projectName}`);
  assert.equal(packageDetails.version, '0.0.0-semantically-released');

  if (dialects.COMMON_JS === dialect) {
    assert.deepEqual(packageDetails.files, ['example.js', 'index.js']);

    assert.isUndefined(packageDetails.main);
    assert.isUndefined(packageDetails.module);
    assert.isUndefined(packageDetails.sideEffects);
  } else {
    assert.equal(packageDetails.main, 'lib/index.cjs.js');
    assert.equal(packageDetails.module, 'lib/index.es.js');
    assert.deepEqual(packageDetails.files, ['example.js', 'lib/']);
    assert.isFalse(packageDetails.sideEffects);
  }

  if ('Public' === visibility) {
    assert.equal(packageDetails.runkitExampleFilename, './example.js');
    assert.deepEqual(packageDetails.publishConfig, {access: 'public'});
  } else {
    assert.isUndefined(packageDetails.runkitExampleFilename);
    assert.deepEqual(packageDetails.publishConfig, {access: 'restricted'});
  }
}

function assertThatApplicationSpecificDetailsAreDefinedCorrectly(packageDetails, projectName) {
  assert.equal(packageDetails.name, projectName);
  assert.isTrue(packageDetails.private);

  assert.isUndefined(packageDetails.files);
  assert.isUndefined(packageDetails.version);
  assert.isUndefined(packageDetails.publishConfig);
}

function assertThatCliSpecificDetailsAreDefinedCorrectly(packageDetails, npmAccount, projectName, visibility) {
  assert.equal(packageDetails.name, `@${npmAccount}/${projectName}`);
  assert.equal(packageDetails.version, '0.0.0-semantically-released');
  assert.deepEqual(packageDetails.bin, {});
  assert.deepEqual(packageDetails.files, ['bin/']);
  assert.deepEqual(
    packageDetails.publishConfig,
    {access: 'Private' === visibility ? 'restricted' : 'public'}
  );
}

export async function assertThatPackageDetailsAreConfiguredCorrectlyFor({
  projectType,
  visibility,
  tested,
  dialect,
  projectName,
  npmAccount
}) {
  const {dialects} = require('@form8ion/javascript-core');
  const packageDetails = JSON.parse(await promises.readFile(`${process.cwd()}/package.json`, 'utf-8'));

  if (tested && 'package' === projectType && dialects.COMMON_JS !== dialect) {
    assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label build --parallel lint:* --parallel test:*');
  } else if (tested) {
    assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:* --parallel test:*');
  } else {
    assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:*');
  }

  if ('application' === projectType) {
    assertThatApplicationSpecificDetailsAreDefinedCorrectly(packageDetails, projectName);
  } else {
    assert.isUndefined(packageDetails.private);
  }

  if ('package' === projectType) {
    assertThatPackageSpecificDetailsAreDefinedCorrectly(
      packageDetails,
      npmAccount,
      projectName,
      dialect,
      visibility
    );
  } else {
    assert.isUndefined(packageDetails.main);
    assert.isUndefined(packageDetails.module);
    assert.isUndefined(packageDetails.sideEffects);
  }

  if ('cli' === projectType) {
    assertThatCliSpecificDetailsAreDefinedCorrectly(packageDetails, npmAccount, projectName, visibility);
  } else {
    assert.isUndefined(packageDetails.bin);
  }
}

export async function assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(projectType) {
  const npmConfigDetails = (await promises.readFile(`${process.cwd()}/.npmrc`)).toString().split(EOL);

  assert.include(npmConfigDetails, 'update-notifier=false');

  if (isNonConsumable(projectType)) {
    assert.include(npmConfigDetails, 'save-exact=true');
  } else {
    assert.notInclude(npmConfigDetails, 'save-exact=true');
  }
}

Given(/^the npm cli is logged in$/, function () {
  const {packageManagers} = require('@form8ion/javascript-core');
  this.packageManager = packageManagers.NPM;
  this.npmAccount = any.word();

  const error = new Error('Command failed with exit code 1: npm ls husky --json');
  error.exitCode = 1;
  error.stdout = JSON.stringify({});
  error.command = 'npm ls husky --json';

  td.when(this.execa('npm', ['whoami'])).thenResolve({stdout: this.npmAccount});
  td.when(this.execa(td.matchers.contains('. ~/.nvm/nvm.sh && nvm use && npm install'))).thenResolve({stdout: ''});
  td.when(this.execa('npm', ['ls', 'husky', '--json'])).thenReject(error);
});

Then('the npm cli is configured for use', async function () {
  const {packageManagers} = require('@form8ion/javascript-core');
  const [lockfileLintConfig] = await Promise.all([
    fs.readFile(`${process.cwd()}/.lockfile-lintrc.json`, 'utf-8'),
    assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(this.projectType.toLowerCase())
  ]);

  const {type, 'allowed-hosts': allowedHosts, path} = JSON.parse(lockfileLintConfig);

  assert.equal(type, packageManagers.NPM);
  assert.include(allowedHosts, packageManagers.NPM);
  assert.equal(path, 'package-lock.json');
  assert.equal(this.scaffoldResult.verificationCommand, 'npm run generate:md && npm test');
  td.verify(this.execa(td.matchers.contains('. ~/.nvm/nvm.sh && nvm use && npm install')), {ignoreExtraArgs: true});
});
