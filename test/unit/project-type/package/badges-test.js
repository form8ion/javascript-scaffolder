import any from '@travi/any';
import {assert} from 'chai';
import defineBadges from '../../../../src/project-type/package/badges';

suite('badges for package project-type', () => {
  const packageName = any.word();
  const semanticReleaseBadgeDetails = {
    img: 'https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg',
    text: 'semantic-release',
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
    assert.deepEqual(defineBadges(packageName, 'Public').consumer.npm, npmBadgeDetails);
  });
});
