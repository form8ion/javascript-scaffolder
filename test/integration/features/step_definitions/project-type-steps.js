import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {Given, Then} from 'cucumber';
import {assert} from 'chai';

Given('the project will be a(n) {string}', async function (projectType) {
  const {projectTypes} = require('@form8ion/javascript-core');
  this.projectType = projectType;

  if (!Object.values(projectTypes).includes(projectType)) throw new Error('invalid project type');
});

Then('the expected details are provided for a root-level project', async function () {
  const nvmRc = await fs.readFile(`${process.cwd()}/.nvmrc`);

  assert.equal(nvmRc.toString(), `v${this.latestLtsMajorVersion}`);
  assert.isTrue(await fileExists(`${process.cwd()}/.huskyrc.json`));
  assert.isTrue(await fileExists(`${process.cwd()}/.czrc`));
  assert.isTrue(await fileExists(`${process.cwd()}/.commitlintrc.js`));
  assert.containsAllKeys(this.scaffoldResult.badges.contribution, ['commit-convention', 'commitizen']);
});
