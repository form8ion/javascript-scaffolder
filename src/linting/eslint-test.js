import {promises as fsPromises} from 'fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as mkdir from '../../third-party-wrappers/make-dir';
import scaffoldEsLint from './eslint';

suite('eslint config scaffolder', () => {
  let sandbox;
  const packageName = any.word();
  const scope = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'writeFile');
    sandbox.stub(mkdir, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the dependency is installed if the config is defined', async () => {
    const result = await scaffoldEsLint({config: {scope}});

    assert.deepEqual(result.devDependencies, [`${scope}/eslint-config`]);
  });

  test('that the script is defined', async () => {
    assert.deepEqual((await scaffoldEsLint({config: {packageName}})).scripts, {'lint:js': 'eslint . --cache'});
  });

  test('that the cache file is ignored from version control', async () => {
    const result = await scaffoldEsLint({config: {packageName}});

    assert.deepEqual(result.vcsIgnore.files, ['.eslintcache']);
  });

  suite('config', () => {
    const projectRoot = any.string();

    test('that the base config is added to the root of the project if the config scope is provided', async () => {
      await scaffoldEsLint({projectRoot, config: {packageName, scope}});

      assert.calledWith(
        fsPromises.writeFile,
        `${projectRoot}/.eslintrc.yml`,
        `root: true
extends: '${scope}'`
      );
    });

    test('that the additional configs are added if the config scope is provided', async () => {
      const pathToCreatedDirectory = any.string();
      const additionalConfigs = any.listOf(any.word);
      mkdir.default.withArgs(`${projectRoot}/test/unit`).resolves(pathToCreatedDirectory);

      const result = await scaffoldEsLint({
        projectRoot,
        config: {packageName, scope},
        unitTested: true,
        additionalConfigs
      });

      assert.calledWith(
        fsPromises.writeFile,
        `${projectRoot}/.eslintrc.yml`,
        `root: true
extends:
  - '${scope}'
  - '${scope}/${additionalConfigs.join(`'\n  - '${scope}/`)}'`
      );
      assert.deepEqual(
        result.devDependencies,
        [`${scope}/eslint-config`, ...additionalConfigs.map(config => `${scope}/eslint-config-${config}`)]
      );
    });

    test('that no additional configs are added if the additional list is empty', async () => {
      await scaffoldEsLint({projectRoot, config: {packageName, scope}, additionalConfigs: []});

      assert.calledWith(
        fsPromises.writeFile,
        `${projectRoot}/.eslintrc.yml`,
        `root: true
extends: '${scope}'`
      );
    });

    test('that a file pattern can be specified for a config', async () => {
      const pathToCreatedDirectory = any.string();
      const filePattern = any.string();
      const configName = any.word();
      const stringConfigs = any.listOf(any.word);
      const additionalConfigs = [...stringConfigs, {name: configName, files: filePattern}];
      mkdir.default.withArgs(`${projectRoot}/test/unit`).resolves(pathToCreatedDirectory);

      const result = await scaffoldEsLint({
        projectRoot,
        config: {packageName, scope},
        unitTested: true,
        additionalConfigs
      });

      assert.calledWith(
        fsPromises.writeFile,
        `${projectRoot}/.eslintrc.yml`,
        `root: true
extends:
  - '${scope}'
  - '${scope}/${stringConfigs.join(`'\n  - '${scope}/`)}'

overrides:
  - files: ${filePattern}
    extends: '${scope}/${configName}'
`
      );
      assert.deepEqual(
        result.devDependencies,
        [
          `${scope}/eslint-config`,
          ...stringConfigs.map(config => `${scope}/eslint-config-${config}`),
          `${scope}/eslint-config-${configName}`
        ]
      );
    });

    suite('eslint-ignore', () => {
      test('that non-source files are excluded from linting', async () => {
        const buildDirectory = any.string();

        await scaffoldEsLint({projectRoot, config: {packageName, scope}, buildDirectory});

        assert.calledWith(fsPromises.writeFile, `${projectRoot}/.eslintignore`, sinon.match(`/${buildDirectory}/`));
        assert.neverCalledWith(fsPromises.writeFile, `${projectRoot}/.eslintignore`, sinon.match('/coverage/'));
      });

      test('that the coverage folder is excluded from linting when the project is unit tested', async () => {
        await scaffoldEsLint({projectRoot, config: {packageName, scope}, unitTested: true});

        assert.calledWith(
          fsPromises.writeFile,
          `${projectRoot}/.eslintignore`,
          sinon.match(`
/coverage/`)
        );
      });
    });
  });
});
