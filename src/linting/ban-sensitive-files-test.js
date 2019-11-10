import {assert} from 'chai';
import scaffoldBanSensitiveFiles from './ban-sensitive-files';

suite('lint for sensitive files', () => {
  test('that ban-sensitive-files is configured', () => {
    assert.deepEqual(
      scaffoldBanSensitiveFiles(),
      {scripts: {'lint:sensitive': 'ban'}, devDependencies: ['ban-sensitive-files']}
    );
  });
});
