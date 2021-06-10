import {promises as fs} from 'fs';
import {EOL} from 'os';
import {assert} from 'chai';
import {fileExists} from '@form8ion/core';

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
