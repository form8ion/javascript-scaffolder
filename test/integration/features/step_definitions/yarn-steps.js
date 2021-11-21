import {promises as fs} from 'fs';
import {Given, Then} from '@cucumber/cucumber';
import any from '@travi/any';
import td from 'testdouble';
import {assert} from 'chai';
import {assertThatNpmConfigDetailsAreConfiguredCorrectlyFor} from './npm-steps';

Given('the yarn cli is logged in', async function () {
  const {packageManagers} = require('@form8ion/javascript-core');
  this.packageManager = packageManagers.YARN;
  this.npmAccount = any.word();

  const error = new Error('Command failed with exit code 1: npm ls husky --json');
  error.exitCode = 1;
  error.stdout = JSON.stringify({});
  error.command = 'npm ls husky --json';

  td.when(this.execa(td.matchers.contains('. ~/.nvm/nvm.sh && nvm use && yarn add'))).thenResolve({stdout: ''});
  td.when(this.execa('npm', ['ls', 'husky', '--json'])).thenResolve({stdout: JSON.stringify({})});
  td.when(this.execa('npm', ['ls', 'husky', '--json'])).thenReject(error);
});

Then('the yarn cli is configured for use', async function () {
  const {packageManagers} = require('@form8ion/javascript-core');
  const [lockfileLintConfig] = await Promise.all([
    fs.readFile(`${process.cwd()}/.lockfile-lintrc.json`, 'utf-8'),
    assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(this.projectType)
  ]);

  const {type, 'allowed-hosts': allowedHosts, path} = JSON.parse(lockfileLintConfig);

  assert.equal(type, packageManagers.YARN);
  assert.include(allowedHosts, packageManagers.YARN);
  assert.equal(path, 'yarn.lock');
  assert.equal(this.scaffoldResult.verificationCommand, 'yarn generate:md && yarn test');
  td.verify(this.execa(td.matchers.contains('. ~/.nvm/nvm.sh && nvm use && yarn add')), {ignoreExtraArgs: true});
});
