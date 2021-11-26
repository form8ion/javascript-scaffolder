import any from '@travi/any';
import {assert} from 'chai';
import defineBadges from './badges';

suite('badges for package project-type', () => {
  const packageName = any.word();
  const semanticReleaseBadgeDetails = {
    img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
    text: 'semantic-release: angular',
    link: 'https://github.com/semantic-release/semantic-release'
  };
  const npmBadgeDetails = {
    img: `https://img.shields.io/npm/v/${packageName}.svg`,
    text: 'npm',
    link: `https://www.npmjs.com/package/${packageName}`
  };

  test('that the badges are defined', () => {
    assert.deepEqual(
      defineBadges(packageName),
      {consumer: {}, contribution: {'semantic-release': semanticReleaseBadgeDetails}, status: {}}
    );
  });

  test('that the npm badge is returned for public projects', () => {
    assert.deepEqual(defineBadges(packageName, 'Public').consumer, {npm: npmBadgeDetails});
  });
});
