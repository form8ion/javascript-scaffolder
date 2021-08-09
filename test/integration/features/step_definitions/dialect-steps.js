import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {load} from 'js-yaml';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import any from '@travi/any';
import {assertDevDependencyIsInstalled} from './common-steps';

Given('the project will use the {string} dialect', async function (dialect) {
  const {dialects} = require('@form8ion/javascript-core');
  this.dialect = dialect;

  if (dialects.TYPESCRIPT === dialect) {
    this.typescriptConfig = {scope: `@${any.word()}`};
  }
});

Given('a babel preset is provided', async function () {
  this.babelPreset = {name: any.word(), packageName: any.word()};
});

Given('no babel preset is provided', async function () {
  this.babelPreset = undefined;
});

Then('the {string} dialect is configured', async function (dialect) {
  const {dialects} = require('@form8ion/javascript-core');
  const eslintConfig = load(await fs.readFile(`${process.cwd()}/.eslintrc.yml`, 'utf-8'));

  if (dialects.BABEL === dialect) {
    const {presets, ignore} = JSON.parse(await fs.readFile(`${process.cwd()}/.babelrc`, 'utf-8'));

    assert.deepEqual(presets, [this.babelPreset.name]);
    assert.deepEqual(ignore, [`./${this.buildDirectory}/`]);
    assertDevDependencyIsInstalled(this.execa, this.babelPreset.packageName);
  }

  if (dialects.TYPESCRIPT === dialect) {
    assert.include(eslintConfig.extends, `${this.eslintScope}/typescript`);

    assert.isFalse(await fileExists(`${process.cwd()}/.babelrc`));
  }

  if (dialects.COMMON_JS === dialect) {
    assert.isFalse(await fileExists(`${process.cwd()}/.babelrc`));
  }
});

Then('an error is reported about the missing babel preset', async function () {
  assert.equal(this.resultError.message, 'No babel preset provided. Cannot configure babel transpilation');
});
