import {packageManagers} from '@form8ion/javascript-core';
import {assert} from 'chai';
import any from '@travi/any';
import buildCommand from './generation-command';

suite('documentation generation command', () => {
  test('that the npm variation of the command is returned', () => {
    assert.equal(buildCommand(packageManagers.NPM), 'npm run generate:md');
  });

  test('that the yarn variation of the command is returned', () => {
    assert.equal(buildCommand(packageManagers.YARN), 'yarn generate:md');
  });

  test('that an error is thrown for unsupported package managers', async () => {
    const packageManager = any.word();

    try {
      await buildCommand(packageManager);

      throw new Error('An error should have been thrown for the unsupported package manager');
    } catch (e) {
      assert.equal(
        e.message,
        `The ${packageManager} package manager is currently not supported. `
        + `Only ${Object.values(packageManagers).join(' and ')} are currently supported.`
      );
    }
  });
});
