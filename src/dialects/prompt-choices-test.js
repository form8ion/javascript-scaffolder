import {dialects} from '@form8ion/javascript-core';
import {assert} from 'chai';
import buildDialectChoices from './prompt-choices';

suite('dialect prompt questions', () => {
  test('that the available dialects are listed', () => {
    assert.deepEqual(buildDialectChoices(), [dialects.COMMON_JS, dialects.BABEL]);
  });
});
