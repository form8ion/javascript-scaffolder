import {promises as fsPromises, promises as fs} from 'fs';
import mustache from 'mustache';
import {dialects} from '@form8ion/javascript-core';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as touch from '../../../third-party-wrappers/touch';
import * as mkdir from '../../../third-party-wrappers/make-dir';
import * as camelcase from '../../../third-party-wrappers/camelcase';
import * as rollupScaffolder from '../../build/rollup';
import * as templatePath from '../../template-path';
import buildDetails from './build-details';

suite('package build details', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.word();
  const pathToExample = `${projectRoot}/example.js`;
  const pathToCreatedSrcDirectory = any.string();
  const rollupResults = any.simpleObject();
  const exampleContent = any.string();
  const pathToExampleTemplate = any.string();
  const exampleTemplateContent = any.string();
  const camelizedProjectName = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(fs, 'readFile');
    sandbox.stub(touch, 'default');
    sandbox.stub(mkdir, 'default');
    sandbox.stub(templatePath, 'default');
    sandbox.stub(rollupScaffolder, 'scaffold');
    sandbox.stub(mustache, 'render');
    sandbox.stub(camelcase, 'default');

    mkdir.default.withArgs(`${projectRoot}/src`).resolves(pathToCreatedSrcDirectory);
    rollupScaffolder.scaffold.withArgs({projectRoot}).resolves(rollupResults);
    templatePath.default.withArgs('example.mustache').returns(pathToExampleTemplate);
    fsPromises.readFile.withArgs(pathToExampleTemplate, 'utf8').resolves(exampleTemplateContent);
    camelcase.default.withArgs(projectName).returns(camelizedProjectName);
    mustache.render.withArgs(exampleTemplateContent, {projectName: camelizedProjectName}).returns(exampleContent);
  });

  teardown(() => sandbox.restore());

  test('that common-js project is defined correctly', async () => {
    assert.deepEqual(await buildDetails({dialect: dialects.COMMON_JS, projectRoot, projectName}), {});
    assert.calledWith(fsPromises.writeFile, pathToExample, `const ${camelizedProjectName} = require('.');\n`);
    assert.calledWith(touch.default, `${projectRoot}/index.js`);
  });

  test('that a modern-js project is defined correctly', async () => {
    const results = await buildDetails({dialect: dialects.BABEL, projectRoot, projectName});

    assert.deepEqual(
      results,
      {
        ...rollupResults,
        devDependencies: ['rimraf'],
        scripts: {
          clean: 'rimraf ./lib',
          prebuild: 'run-s clean',
          build: 'npm-run-all --print-label --parallel build:*',
          prepack: 'run-s build'
        },
        vcsIgnore: {directories: ['/lib/']},
        buildDirectory: 'lib',
        badges: {consumer: {}}
      }
    );
    assert.calledWith(touch.default, `${pathToCreatedSrcDirectory}/index.js`);
    assert.calledWith(fsPromises.writeFile, pathToExample, exampleContent);
  });

  test('that the runkit badge is included for public projects', async () => {
    const packageName = any.word();

    const {badges} = await buildDetails({
      dialect: dialects.BABEL,
      projectRoot,
      projectName,
      packageName,
      visibility: 'Public'
    });

    assert.deepEqual(
      badges.consumer.runkit,
      {
        img: `https://badge.runkitcdn.com/${packageName}.svg`,
        text: `Try ${packageName} on RunKit`,
        link: `https://npm.runkit.com/${packageName}`
      }
    );
  });
});
