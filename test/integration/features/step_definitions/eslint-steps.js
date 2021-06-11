import {promises as fs} from 'fs';
import {EOL} from 'os';
import {load} from 'js-yaml';
import {assert} from 'chai';
import {fileExists} from '@form8ion/core';
import {Then} from '@cucumber/cucumber';

export async function assertThatProperDirectoriesAreIgnoredFromEslint(projectType, transpileAndLint, unitTested) {
  if (transpileAndLint) {
    const eslintIgnoreDetails = (await fs.readFile(`${process.cwd()}/.eslintignore`)).toString().split(EOL);

    if ('cli' === projectType) {
      assert.include(eslintIgnoreDetails, '/bin/');
      assert.notInclude(eslintIgnoreDetails, '/lib/');
    } else {
      assert.include(eslintIgnoreDetails, '/lib/');
      assert.notInclude(eslintIgnoreDetails, '/bin/');
    }

    if (unitTested) {
      assert.include(eslintIgnoreDetails, '/coverage/');
    } else {
      assert.notInclude(eslintIgnoreDetails, '/coverage/');
    }
  } else assert.isFalse(await fileExists(`${process.cwd()}/.eslintrc.yml`));
}

Then('the base ESLint config is extended', async function () {
  const config = load(await fs.readFile(`${process.cwd()}/.eslintrc.yml`));

  assert.equal(config.extends, this.eslintScope);
});
