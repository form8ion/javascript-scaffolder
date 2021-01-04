import {Given, Then} from 'cucumber';
import any from '@travi/any';
import td from 'testdouble';
import {assertThatNpmConfigDetailsAreConfiguredCorrectlyFor} from './npm-steps';

Given('the yarn cli is logged in', async function () {
  this.npmAccount = any.word();
});

Then('the yarn cli is configured for use', async function () {
  await assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(this.projectType.toLowerCase());
  td.verify(this.execa('yarn'));
});
