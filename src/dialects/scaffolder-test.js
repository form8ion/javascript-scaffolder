import {dialects} from '@form8ion/javascript-core';
import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as babel from './babel';
import * as typescript from './typescript';
import * as esm from './esm';
import scaffoldDialect from './scaffolder';

suite('scaffold dialect', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(babel, 'default');
    sandbox.stub(typescript, 'default');
    sandbox.stub(esm, 'default');
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

  test('that typescript is scaffolded when chosen', async () => {
    const typescriptConfigs = any.simpleObject();
    const typescriptResults = any.simpleObject();
    const testFilenamePattern = any.string();
    const projectType = any.word();
    typescript.default
      .withArgs({config: typescriptConfigs, projectType, projectRoot, testFilenamePattern})
      .resolves(typescriptResults);

    assert.equal(
      await scaffoldDialect({
        dialect: dialects.TYPESCRIPT,
        projectType,
        configs: {typescript: typescriptConfigs},
        projectRoot,
        testFilenamePattern
      }),
      typescriptResults
    );
  });

  test('that ESM is scaffolded when chosen', async () => {
    const esmResults = any.simpleObject();
    esm.default.resolves(esmResults);

    assert.equal(
      await scaffoldDialect({dialect: dialects.ESM}),
      esmResults
    );
  });

  test('that neither babel nor typescript are scaffolded when not chosen', async () => {
    assert.deepEqual(await scaffoldDialect({dialect: any.word()}), {eslint: {}});
    assert.notCalled(babel.default);
    assert.notCalled(typescript.default);
  });
});
