import {EOL} from 'os';
import {promises} from 'fs';
import {Given, Then} from 'cucumber';
import any from '@travi/any';
import {assert} from 'chai';
import td from 'testdouble';

function assertThatPackageSpecificDetailsAreDefinedCorrectly(
  packageDetails,
  npmAccount,
  projectName,
  transpileAndLint,
  visibility
) {
  assert.equal(packageDetails.name, `@${npmAccount}/${projectName}`);
  assert.equal(packageDetails.version, '0.0.0-semantically-released');

  if (transpileAndLint) {
    assert.equal(packageDetails.main, 'lib/index.cjs.js');
    assert.equal(packageDetails.module, 'lib/index.es.js');
    assert.deepEqual(packageDetails.files, ['example.js', 'lib/']);
    assert.isFalse(packageDetails.sideEffects);
  } else {
    assert.deepEqual(packageDetails.files, ['example.js', 'index.js']);

    assert.isUndefined(packageDetails.main);
    assert.isUndefined(packageDetails.module);
    assert.isUndefined(packageDetails.sideEffects);
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
  transpileAndLint,
  projectName,
  npmAccount
}) {
  const packageDetails = JSON.parse(await promises.readFile(`${process.cwd()}/package.json`));

  if (tested && 'package' === projectType && transpileAndLint) {
    assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label build --parallel lint:* --parallel test:*');
  } else if (tested) {
    assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:* --parallel test:*');
  // } else if ('package' === projectType && transpileAndLint) {
  //   assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label build --parallel lint:*');
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
      transpileAndLint,
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

  if ('application' === projectType || 'cli' === projectType) {
    assert.include(npmConfigDetails, 'save-exact=true');
  } else {
    assert.notInclude(npmConfigDetails, 'save-exact=true');
  }
}

Given(/^the npm cli is logged in$/, function () {
  this.npmAccount = any.word();

  td.when(this.execa('npm', ['whoami'])).thenResolve({stdout: this.npmAccount});
});

Then('the npm cli is configured for use', async function () {
  await assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(this.projectType.toLowerCase());
});
