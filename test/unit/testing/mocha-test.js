import {assert} from 'chai';
import any from '@travi/any';
import scaffoldMocha from '../../../src/testing/mocha';

suite('mocha scaffolder', () => {
  const projectRoot = any.string();

  test('that mocha is scaffolded', async () => {
    assert.deepEqual(await scaffoldMocha({projectRoot}), {devDependencies: ['mocha', 'chai', 'sinon']});
  });
});
