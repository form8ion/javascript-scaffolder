import {EOL} from 'os';
import {readFile} from 'mz/fs';
import {Given} from 'cucumber';
import any from '@travi/any';
import {assert} from 'chai';
import * as execa from '../../../../third-party-wrappers/execa';

export async function assertThatPackageDetailsAreConfiguredCorrectlyFor({
  projectType,
  visibility,
  transpileAndLint,
  projectName,
  npmAccount
}) {
  const packageDetails = JSON.parse(await readFile(`${process.cwd()}/package.json`));

  if ('application' === projectType) {
    assert.equal(packageDetails.name, projectName);
    assert.isTrue(packageDetails.private);
    assert.isUndefined(packageDetails.files);
    assert.isUndefined(packageDetails.version);
    assert.isUndefined(packageDetails.publishConfig);
  } else {
    assert.isUndefined(packageDetails.private);
  }

  if ('package' === projectType) {
    assert.equal(packageDetails.name, `@${npmAccount}/${projectName}`);
    assert.equal(packageDetails.version, '0.0.0-semantically-released');
    if (transpileAndLint) {
      assert.equal(packageDetails.main, 'lib/index.cjs.js');
      assert.equal(packageDetails.module, 'lib/index.es.js');
      assert.deepEqual(packageDetails.files, ['lib/']);
      assert.isFalse(packageDetails.sideEffects);
    } else {
      assert.deepEqual(packageDetails.files, ['index.js']);
      assert.isUndefined(packageDetails.main);
      assert.isUndefined(packageDetails.module);
      assert.isUndefined(packageDetails.sideEffects);
    }
    assert.deepEqual(
      packageDetails.publishConfig,
      {access: 'Private' === visibility ? 'restricted' : 'public'}
    );
  } else {
    assert.isUndefined(packageDetails.main);
    assert.isUndefined(packageDetails.module);
    assert.isUndefined(packageDetails.sideEffects);
  }

  if ('cli' === projectType) {
    assert.equal(packageDetails.name, 'Private' === visibility ? `@${npmAccount}/${projectName}` : projectName);
    assert.equal(packageDetails.version, '0.0.0-semantically-released');
    assert.deepEqual(packageDetails.bin, {});
    assert.deepEqual(packageDetails.files, ['bin/']);
    assert.deepEqual(
      packageDetails.publishConfig,
      {access: 'Private' === visibility ? 'restricted' : 'public'}
    );
  } else {
    assert.isUndefined(packageDetails.bin);
  }
}

export async function assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(projectType) {
  const npmConfigDetails = (await readFile(`${process.cwd()}/.npmrc`)).toString().split(EOL);

  assert.include(npmConfigDetails, 'update-notifier=false');

  if ('application' === projectType || 'cli' === projectType) {
    assert.include(npmConfigDetails, 'save-exact=true');
  } else {
    assert.notInclude(npmConfigDetails, 'save-exact=true');
  }
}

Given(/^the npm cli is logged in$/, function () {
  this.npmAccount = any.word();

  execa.default.withArgs('npm', ['whoami']).resolves({stdout: this.npmAccount});
});
