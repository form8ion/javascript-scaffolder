import {promises as fsPromises} from 'fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import scaffold from './commitizen';

suite('commitizen', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the config file is written and dependencies are returned', async () => {
    const projectRoot = any.string();

    const result = await scaffold({projectRoot});

    assert.calledWith(
      fsPromises.writeFile,
      `${projectRoot}/.czrc`,
      JSON.stringify({path: './node_modules/cz-conventional-changelog'})
    );
    assert.deepEqual(
      result,
      {
        devDependencies: ['cz-conventional-changelog'],
        badges: {
          contribution: {
            commitizen: {
              img: 'https://img.shields.io/badge/commitizen-friendly-brightgreen.svg',
              text: 'Commitizen friendly',
              link: 'http://commitizen.github.io/cz-cli/'
            }
          }
        }
      }
    );
  });
});
