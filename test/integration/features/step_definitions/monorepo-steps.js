import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {Given, Then} from '@cucumber/cucumber';
import any from '@travi/any';
import {assert} from 'chai';

Given('the package will be added to an existing monorepo', async function () {
  this.pathWithinParent = any.string();
  this.ciAnswer = null;
});

Given('the chosen monorepo plugin defines scripts', async function () {
  this.projectTypeChoiceAnswer = 'foo';
});

Then('project-level tools are not installed for a sub-project', async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/.nvmrc`));
  assert.isFalse(await fileExists(`${process.cwd()}/.huskyrc.json`));
  assert.isFalse(await fileExists(`${process.cwd()}/.czrc`));
  assert.isFalse(await fileExists(`${process.cwd()}/.commitlintrc.js`));
});

Then('the monorepo scripts are included', async function () {
  const {scripts} = JSON.parse(await fs.readFile(`${process.cwd()}/package.json`, 'utf-8'));

  assert.include(scripts, this.fooMonorepoScripts);
});
