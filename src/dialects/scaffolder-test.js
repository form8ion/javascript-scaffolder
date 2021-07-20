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

  test('that the details of the chosen dialect are scaffolded', async () => {
    const babelPreset = any.word();
    const transpileLint = any.boolean();
    const tests = any.simpleObject();
    const buildDirectory = any.string();
    const babelResults = any.simpleObject();
    babel.default
      .withArgs({preset: babelPreset, projectRoot, transpileLint, tests, buildDirectory})
      .resolves(babelResults);

    assert.equal(
      await scaffoldDialect({configs: {babelPreset}, projectRoot, transpileLint, tests, buildDirectory}),
      babelResults
    );
  });
});
