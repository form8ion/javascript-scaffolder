import {promises as fsPromises} from 'fs';
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
  [require('remark-toc'), {tight: true}]
];`
    );
  });

  test('that the remark-usage plugin is configured for package projects', async () => {
    const config = any.string();
    const projectRoot = any.string();

    assert.deepEqual(
      await scaffoldRemark({config, projectRoot, projectType: 'Package', vcs: any.simpleObject()}),
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
  [require('remark-toc'), {tight: true}],
  ['remark-usage', {heading: 'example', main: './src'}]
];`
    );
  });

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
  [require('remark-toc'), {tight: true}],
  ['validate-links', {repository: false}]
];`
    );
  });
});
