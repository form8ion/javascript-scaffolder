import {promises as fs} from 'fs';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import any from '@travi/any';
import {assertDevDependencyIsInstalled} from './common-steps';

Given('a babel preset is provided', async function () {
  this.babelPreset = {name: any.word(), packageName: any.word()};
});

Given('no babel preset is provided', async function () {
  this.babelPreset = undefined;
});

Then('the {string} dialect is configured', async function (dialect) {
  if ('babel' === dialect) {
    const {presets, ignore} = JSON.parse(await fs.readFile(`${process.cwd()}/.babelrc`, 'utf-8'));

    assert.deepEqual(presets, [this.babelPreset.name]);
    assert.deepEqual(ignore, [`./${this.buildDirectory}/`]);
    assertDevDependencyIsInstalled(this.execa, this.babelPreset.packageName);
  }
});

Then('an error is reported about the missing babel preset', async function () {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});
