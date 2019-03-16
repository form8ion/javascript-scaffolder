import {assert} from 'chai';
import any from '@travi/any';
import scaffoldRemark from '../../../src/linting/remark';

suite('remark config scaffolder', () => {
  test('that the config is written and dependencies are defined', async () => {
    const config = any.string();

    assert.deepEqual(await scaffoldRemark({config}), {devDependencies: [config, 'remark-cli']});
  });
});
