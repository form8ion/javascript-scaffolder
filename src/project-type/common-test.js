import {assert} from 'chai';
import scaffoldCommonDetails from './common';

suite('common project-type details', () => {
  test('that the function is ready to define future common details', () => {
    assert.deepEqual(scaffoldCommonDetails(), {});
  });
});
