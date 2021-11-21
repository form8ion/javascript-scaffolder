import {dialects} from '@form8ion/javascript-core';
import {assert} from 'chai';
import any from '@travi/any';
import buildDialectChoices from './prompt-choices';

suite('dialect prompt questions', () => {
  test('that the available dialects are listed', () => {
    assert.deepEqual(
      buildDialectChoices({...any.simpleObject(), babelPreset: any.simpleObject(), typescript: any.simpleObject()}),
      [
        {name: 'Common JS (no transpilation)', value: dialects.COMMON_JS, short: 'cjs'},
        {name: 'Modern JavaScript (transpiled)', value: dialects.BABEL, short: 'modern'},
        {name: 'ESM-only (no transpilation)', value: dialects.ESM, short: 'esm'},
        {name: 'TypeScript', value: dialects.TYPESCRIPT, short: 'ts'}
      ]
    );
  });

  test('that `babel` and `typescript` are not included in the choices list when configs are not provided', () => {
    assert.deepEqual(
      buildDialectChoices(any.simpleObject()),
      [
        {name: 'Common JS (no transpilation)', value: dialects.COMMON_JS, short: 'cjs'},
        {name: 'ESM-only (no transpilation)', value: dialects.ESM, short: 'esm'}
      ]
    );
  });
});
