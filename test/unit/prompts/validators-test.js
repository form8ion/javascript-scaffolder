import {assert} from 'chai';
import {scope} from '../../../src/prompts/validators';

suite('question validators', () => {
  suite('scope', () => {
    test('that a scope is required for private projects', () => {
      assert.equal(
        scope('Private')(),
        'Private packages must be scoped (https://docs.npmjs.com/private-modules/intro#setting-up-your-package)'
      );
    });

    test('that the scope resolves to valid when provided for private projects', () => {
      assert.equal(
        scope('Private')(),
        'Private packages must be scoped (https://docs.npmjs.com/private-modules/intro#setting-up-your-package)'
      );
    });

    test('that empty is a valid answer for non-private projects', () => {
      assert.isTrue(scope('Public')());
    });
  });
});
