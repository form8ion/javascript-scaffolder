import {dialects} from '@form8ion/javascript-core';
import {assert} from 'chai';
import buildDialectChoices from './prompt-choices';

suite('dialect prompt questions', () => {
  test('that the available dialects are listed', () => {
    assert.deepEqual(
      buildDialectChoices(),
      [
        {name: 'Common JS (no transpilation)', value: dialects.COMMON_JS, short: 'cjs'},
        {name: 'Modern JavaScript (transpiled)', value: dialects.BABEL, short: 'modern'}
      ]
    );
  });
});
