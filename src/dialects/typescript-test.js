import {promises as fs} from 'fs';
import {projectTypes} from '@form8ion/javascript-core';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import scaffoldTypescriptDialect from './typescript';

suite('typescript dialect', () => {
  let sandbox;
  const scope = `@${any.word()}`;

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
    const projectRoot = any.string();

    await scaffoldTypescriptDialect({config: {scope}, projectRoot});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/tsconfig.json`,
      JSON.stringify({
        $schema: 'https://json.schemastore.org/tsconfig',
        extends: `${scope}/tsconfig`,
        compilerOptions: {rootDir: 'src'},
        include: ['src/**/*.ts']
      })
    );
  });

  test('that package specific details are defined when the project is a package', async () => {
    const projectRoot = any.string();

    await scaffoldTypescriptDialect({config: {scope}, projectType: projectTypes.PACKAGE, projectRoot});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/tsconfig.json`,
      JSON.stringify({
        $schema: 'https://json.schemastore.org/tsconfig',
        extends: `${scope}/tsconfig`,
        compilerOptions: {
          rootDir: 'src',
          outDir: 'lib',
          declaration: true
        },
        include: ['src/**/*.ts']
      })
    );
  });

  test('that the testFilenamePattern is included as an `exclude` when provided', async () => {
    const projectRoot = any.string();
    const testFilenamePattern = any.string();

    await scaffoldTypescriptDialect({config: {scope}, projectRoot, testFilenamePattern});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/tsconfig.json`,
      JSON.stringify({
        $schema: 'https://json.schemastore.org/tsconfig',
        extends: `${scope}/tsconfig`,
        compilerOptions: {rootDir: 'src'},
        include: ['src/**/*.ts'],
        exclude: [testFilenamePattern]
      })
    );
  });

  test('that dev dependencies are defined', async () => {
    const {devDependencies} = await scaffoldTypescriptDialect({config: {scope}});

    assert.deepEqual(devDependencies, ['typescript', `${scope}/tsconfig`]);
  });

  test('that the types definitions file location is defined', async () => {
    const {packageProperties} = await scaffoldTypescriptDialect({config: {}});

    assert.deepEqual(packageProperties, {types: 'lib/index.d.ts'});
  });

  test('that files to ignore from VCS are defined', async () => {
    const {vcsIgnore: {files}} = await scaffoldTypescriptDialect({config: {}});

    assert.deepEqual(files, ['tsconfig.tsbuildinfo']);
  });
});
