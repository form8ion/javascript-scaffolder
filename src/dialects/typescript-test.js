import {assert} from 'chai';
import scaffoldTypescriptDialect from './typescript';

suite('typescript dialect', () => {
  test('that the eslint config is defined', async () => {
    assert.deepEqual(await scaffoldTypescriptDialect().eslint.configs, ['typescript']);
    assert.deepEqual(await scaffoldTypescriptDialect().eslintConfigs, ['typescript']);
  });
});
