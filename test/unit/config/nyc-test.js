import fs from 'mz/fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldNyc from '../../../src/config/nyc';

suite('nyc scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that nyc is scaffolded', async () => {
    assert.deepEqual(await scaffoldNyc({projectRoot}), {devDependencies: ['nyc']});
    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.nycrc`,
      JSON.stringify({reporter: ['lcov', 'text-summary'], exclude: ['test/']})
    );
  });
});
