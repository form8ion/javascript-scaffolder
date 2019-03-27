import {existsSync} from 'fs';
import {assert} from 'chai';
import {Then} from 'cucumber';

Then(/^Babel and ESLint are not scaffolded$/, async function () {
  assert.isFalse(existsSync(`${process.cwd()}/.eslintrc.yml`));
  assert.isFalse(existsSync(`${process.cwd()}/.babelrc`));
});
