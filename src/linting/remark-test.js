import {promises as fsPromises} from 'fs';
import {projectTypes} from '@form8ion/javascript-core';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import scaffoldRemark from './remark';

suite('remark config scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the config is written and dependencies are defined', async () => {
    const config = any.string();
    const projectRoot = any.string();

    assert.deepEqual(
      await scaffoldRemark({config, projectRoot, vcs: any.simpleObject()}),
      {
        devDependencies: [config, 'remark-cli', 'remark-toc'],
        scripts: {'lint:md': 'remark . --frail', 'generate:md': 'remark . --output'}
      }
    );
    assert.calledWith(
      fsPromises.writeFile,
      `${projectRoot}/.remarkrc.js`,
      `// https://github.com/remarkjs/remark/tree/master/packages/remark-stringify#options
exports.settings = {
  listItemIndent: 1,
  emphasis: '_',
  strong: '_',
  bullet: '*',
  incrementListMarker: false
};

exports.plugins = [
  '${config}',
  ['remark-toc', {tight: true}]
];`
    );
  });

  test('that the remark-usage plugin is configured for package projects', async () => {
    const config = any.string();
    const projectRoot = any.string();

    assert.deepEqual(
      await scaffoldRemark({config, projectRoot, projectType: projectTypes.PACKAGE, vcs: any.simpleObject()}),
      {
        devDependencies: [config, 'remark-cli', 'remark-toc', 'remark-usage'],
        scripts: {'lint:md': 'remark . --frail', 'generate:md': 'remark . --output'}
      }
    );
    assert.calledWith(
      fsPromises.writeFile,
      `${projectRoot}/.remarkrc.js`,
      `// https://github.com/remarkjs/remark/tree/master/packages/remark-stringify#options
exports.settings = {
  listItemIndent: 1,
  emphasis: '_',
  strong: '_',
  bullet: '*',
  incrementListMarker: false
};

exports.plugins = [
  '${config}',
  ['remark-toc', {tight: true}],
  ['remark-usage', {heading: 'example'}]
];`
    );
  });

  test('that the project is built before linting/generating the md when the package will be transpiled', async () => {
    const config = any.string();
    const projectRoot = any.string();

    assert.deepEqual(
      (await scaffoldRemark({
        config,
        projectRoot,
        projectType: projectTypes.PACKAGE,
        vcs: any.simpleObject(),
        transpileLint: true
      })).scripts,
      {
        'lint:md': 'remark . --frail',
        'generate:md': 'remark . --output',
        'pregenerate:md': 'run-s build'
      }
    );
  });

  test(
    'that the project isnt built before linting/generating the md when the non-package will be transpiled',
    async () => {
      const config = any.string();
      const projectRoot = any.string();

      const {'prelint:md': prelint, 'pregenerate:md': pregenerate} = (await scaffoldRemark({
        config,
        projectRoot,
        vcs: any.simpleObject(),
        transpileLint: true
      })).scripts;

      assert.isUndefined(prelint);
      assert.isUndefined(pregenerate);
    }
  );

  test('that the config configures validate-links when the project will not be versioned', async () => {
    const config = any.string();
    const projectRoot = any.string();

    await scaffoldRemark({config, projectRoot, vcs: undefined});
    assert.calledWith(
      fsPromises.writeFile,
      `${projectRoot}/.remarkrc.js`,
      `// https://github.com/remarkjs/remark/tree/master/packages/remark-stringify#options
exports.settings = {
  listItemIndent: 1,
  emphasis: '_',
  strong: '_',
  bullet: '*',
  incrementListMarker: false
};

exports.plugins = [
  '${config}',
  ['remark-toc', {tight: true}],
  ['validate-links', {repository: false}]
];`
    );
  });
});
