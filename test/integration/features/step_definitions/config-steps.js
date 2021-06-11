import {fileExists} from '@form8ion/core';
import {assert} from 'chai';
import {Then} from '@cucumber/cucumber';

Then(/^Babel and ESLint are not scaffolded$/, async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/.eslintrc.yml`));
  assert.isFalse(await fileExists(`${process.cwd()}/.babelrc`));
});
