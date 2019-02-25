import {assert} from 'chai';
import any from '@travi/any';
import scaffoldCucumber from '../../../src/testing/cucumber';

suite('cucumber scaffolder', () => {
  const projectRoot = any.string();

  test('that cucmber is scaffolded', async () => {
    assert.deepEqual(await scaffoldCucumber({projectRoot}), {devDependencies: ['cucumber', 'chai']});
  });
});
