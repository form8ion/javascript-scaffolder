import {dialects} from '@form8ion/javascript-core';
import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as babel from './babel';
import scaffoldDialect from './scaffolder';

suite('scaffold dialect', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(babel, 'default');
  });

  teardown(() => sandbox.restore());

  test('that babel is scaffolded when chosen', async () => {
    const babelPreset = any.word();
    const tests = any.simpleObject();
    const buildDirectory = any.string();
    const babelResults = any.simpleObject();
    babel.default.withArgs({preset: babelPreset, projectRoot, tests, buildDirectory}).resolves(babelResults);

    assert.equal(
      await scaffoldDialect({dialect: dialects.BABEL, configs: {babelPreset}, projectRoot, tests, buildDirectory}),
      babelResults
    );
  });

  test('that babel is not scaffolded when not chosen', async () => {
    assert.deepEqual(await scaffoldDialect({dialect: any.word()}), {});
    assert.notCalled(babel.default);
  });
});
