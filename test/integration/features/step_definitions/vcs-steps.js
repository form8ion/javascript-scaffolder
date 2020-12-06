import {promises as fs} from 'fs';
import {Given, Then} from 'cucumber';
import any from '@travi/any';
import {assert} from 'chai';

const repoOwner = any.word();
const repoName = any.word();

Given(/^the project will not be versioned$/, async function () {
  this.vcs = undefined;
});

Given(/^the project will be versioned on GitHub$/, async function () {
  this.vcs = {host: 'GitHub', owner: repoOwner, name: repoName};
});

Then('no repository details will be defined', async function () {
  const {repository} = JSON.parse(await fs.readFile(`${process.cwd()}/package.json`));

  assert.isUndefined(repository);
});

Then('repository details will be defined using the shorthand', async function () {
  const {repository} = JSON.parse(await fs.readFile(`${process.cwd()}/package.json`));

  assert.equal(repository, `${repoOwner}/${repoName}`);
});

Then('the repository details include the path within the parent project', async function () {
  const {repository} = JSON.parse(await fs.readFile(`${process.cwd()}/package.json`));

  assert.deepEqual(
    repository,
    {
      type: 'git',
      url: `https://github.com/${repoOwner}/${repoName}.git`,
      path: this.pathWithinParent
    }
  );
});
