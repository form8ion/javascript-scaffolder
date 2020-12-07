import {fileExists} from '@form8ion/core';
import {Given, Then} from 'cucumber';
import any from '@travi/any';
import {assert} from 'chai';

Given('the package will be added to an existing monorepo', async function () {
  this.pathWithinParent = any.string();
  this.ciAnswer = null;
});

Then('project-level tools are not installed for a sub-project', async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/.nvmrc`));
  assert.isFalse(await fileExists(`${process.cwd()}/.huskyrc.json`));
  assert.isFalse(await fileExists(`${process.cwd()}/.czrc`));
  assert.isFalse(await fileExists(`${process.cwd()}/.commitlintrc.js`));
});
