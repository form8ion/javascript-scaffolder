import {dialects} from '@form8ion/javascript-core';
import {assert} from 'chai';
import any from '@travi/any';
import buildDialectChoices from './prompt-choices';

suite('dialect prompt questions', () => {
  test('that the available dialects are listed', () => {
    assert.deepEqual(
      buildDialectChoices({...any.simpleObject(), babelPreset: any.simpleObject()}),
      [
        {name: 'Common JS (no transpilation)', value: dialects.COMMON_JS, short: 'cjs'},
        {name: 'Modern JavaScript (transpiled)', value: dialects.BABEL, short: 'modern'}
      ]
    );
  });

  test('that `babel` is not included in the choices list when a preset is not provided', () => {
    assert.deepEqual(
      buildDialectChoices(any.simpleObject()),
      [{name: 'Common JS (no transpilation)', value: dialects.COMMON_JS, short: 'cjs'}]
    );
  });
});
