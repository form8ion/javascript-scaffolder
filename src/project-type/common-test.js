import {assert} from 'chai';
import any from '@travi/any';
import scaffoldCommonDetails from './common';

suite('common project-type details', () => {
  test('that the greenkeeper details are included for public projects when the vcs-host is GitHub', () => {
    const vcs = {host: 'GitHub', owner: any.word(), name: any.word()};

    const results = scaffoldCommonDetails('Public', vcs);

    assert.deepEqual(
      results.badges.contribution.greenkeeper,
      {
        img: `https://badges.greenkeeper.io/${vcs.owner}/${vcs.name}.svg`,
        text: 'Greenkeeper',
        link: 'https://greenkeeper.io/'
      }
    );
    assert.deepEqual(
      results.nextSteps,
      [{summary: 'Register the greenkeeper-keeper webhook'}]
    );
  });

  test('that the greenkeeper details are not included when the project is not versioned', () => {
    const results = scaffoldCommonDetails('Public', undefined);

    assert.isUndefined(results.badges.contribution.greenkeeper);
    assert.deepEqual(results.nextSteps, []);
  });

  test('that the greenkeeper details are not included when the vcs-host is not GitHub', () => {
    const vcs = {host: any.word(), owner: any.word(), name: any.word()};

    const results = scaffoldCommonDetails('Public', vcs);

    assert.isUndefined(results.badges.contribution.greenkeeper);
    assert.deepEqual(results.nextSteps, []);
  });

  test('that the greenkeeper details are not included when the project is private', () => {
    const vcs = {host: 'GitHub', owner: any.word(), name: any.word()};

    const results = scaffoldCommonDetails('Private', vcs);

    assert.isUndefined(results.badges.contribution.greenkeeper);
    assert.deepEqual(results.nextSteps, []);
  });
});
