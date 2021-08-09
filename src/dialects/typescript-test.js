import {promises as fs} from 'fs';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import scaffoldTypescriptDialect from './typescript';

suite('typescript dialect', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the eslint config is defined', async () => {
    const {eslint: {configs}, eslintConfigs} = await scaffoldTypescriptDialect({config: {}});

    assert.deepEqual(configs, ['typescript']);
    assert.deepEqual(eslintConfigs, ['typescript']);
  });

  test('that the tsconfig extends the scoped package', async () => {
    const scope = `@${any.word()}`;
    const projectRoot = any.string();

    await scaffoldTypescriptDialect({config: {scope}, projectRoot});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/tsconfig.json`,
      JSON.stringify({extends: `${scope}/tsconfig`})
    );
  });
});
