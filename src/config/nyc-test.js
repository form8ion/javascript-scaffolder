import {promises as fsPromises} from 'fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldNyc from './nyc';

suite('nyc scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const vcsOwner = any.word();
  const vcsName = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that nyc is scaffolded', async () => {
    assert.deepEqual(
      await scaffoldNyc({projectRoot, vcs: {owner: vcsOwner, name: vcsName, host: 'github'}, visibility: 'Public'}),
      {
        devDependencies: ['nyc'],
        vcsIgnore: {files: [], directories: ['/coverage/', '/.nyc_output/']},
        badges: {
          status: {
            coverage: {
              img: `https://img.shields.io/codecov/c/github/${vcsOwner}/${vcsName}.svg`,
              link: `https://codecov.io/github/${vcsOwner}/${vcsName}`,
              text: 'Codecov'
            }
          }
        }
      }
    );
    assert.calledWith(
      fsPromises.writeFile,
      `${projectRoot}/.nycrc`,
      JSON.stringify({
        reporter: ['lcov', 'text-summary', 'html'],
        exclude: ['src/**/*-test.js', 'test/', 'thirdparty-wrappers/', 'vendor/']
      })
    );
  });

  test('that the coverage badge is not provided when a project is not versioned', async () => {
    assert.isUndefined((await scaffoldNyc({projectRoot, visibility: 'Public'})).badges.status.coverage);
  });

  test('that the coverage badge is not provided when a project is not hosted on github', async () => {
    assert.isUndefined(
      (await scaffoldNyc({
        projectRoot,
        vcs: {owner: vcsOwner, name: vcsName, host: any.word()},
        visibility: 'Public'
      })).badges.status.coverage
    );
  });

  test('that the coverage badge is not provided for private projects', async () => {
    assert.isUndefined(
      (await scaffoldNyc({
        projectRoot,
        vcs: {owner: vcsOwner, name: vcsName, host: 'github'},
        visibility: 'Private'
      })).badges.status.coverage
    );
  });
});
