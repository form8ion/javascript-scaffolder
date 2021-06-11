import {promises as fs} from 'fs';
import {Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import td from 'testdouble';

async function assertHookContainsScript(hook, script) {
  const hookContents = await fs.readFile(`${process.cwd()}/.husky/${hook}`, 'utf-8');

  assert.include(
    hookContents,
    `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"`
  );
  assert.include(hookContents, script);
}

Then('husky is configured for a {string} project', async function (packageManager) {
  td.verify(this.execa(td.matchers.contains('husky')), {ignoreExtraArgs: true});

  await assertHookContainsScript('pre-commit', `${packageManager} test`);
  await assertHookContainsScript('commit-msg', 'npx --no-install commitlint --edit $1');
});
