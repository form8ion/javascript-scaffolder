import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import any from '@travi/any';

Given('the project will be a(n) {string}', async function (projectType) {
  const {projectTypes} = require('@form8ion/javascript-core');
  const projectTypeChoices = [...Object.values(projectTypes), 'Other'];

  this.projectType = projectType;
  if ('any' === projectType) {
    this.projectType = any.fromList(projectTypeChoices);
  }

  if (!projectTypeChoices.includes(this.projectType)) {
    throw new Error(`invalid project type: ${this.projectType}`);
  }

  if (projectTypes.CLI === this.projectType) {
    this.buildDirectory = 'bin';
  } else if ('Other' === this.projectType) {
    this.buildDirectory = null;
  } else {
    this.buildDirectory = 'lib';
  }
});

Then('the expected details are provided for a root-level project', async function () {
  const nvmRc = await fs.readFile(`${process.cwd()}/.nvmrc`);

  assert.equal(nvmRc.toString(), `v${this.latestLtsMajorVersion}`);
  assert.isTrue(await fileExists(`${process.cwd()}/.czrc`));
  assert.isTrue(await fileExists(`${process.cwd()}/.commitlintrc.js`));
  assert.containsAllKeys(this.scaffoldResult.badges.contribution, ['commit-convention', 'commitizen']);
});
