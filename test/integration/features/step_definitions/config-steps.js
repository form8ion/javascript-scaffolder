import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {assert} from 'chai';
import {Then} from 'cucumber';
import {EOL} from 'os';

export async function assertThatProperDirectoriesAreIgnoredFromEslint(projectType, transpileAndLint) {
  if (transpileAndLint) {
    const eslintIgnoreDetails = (await fs.readFile(`${process.cwd()}/.eslintignore`)).toString().split(EOL);

    if ('cli' === projectType) {
      assert.include(eslintIgnoreDetails, '/bin/');
      assert.notInclude(eslintIgnoreDetails, '/lib/');
    } else {
      assert.include(eslintIgnoreDetails, '/lib/');
      assert.notInclude(eslintIgnoreDetails, '/bin/');
    }
  } else assert.isFalse(await fileExists(`${process.cwd()}/.eslintrc.yml`));
}

Then(/^Babel and ESLint are not scaffolded$/, async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/.eslintrc.yml`));
  assert.isFalse(await fileExists(`${process.cwd()}/.babelrc`));
});
