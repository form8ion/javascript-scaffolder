import any from '@travi/any';
import {assert} from 'chai';
import defineBadges from './badges';

suite('badges for package project-type', () => {
  const packageName = any.word();
  const npmBadgeDetails = {
    img: `https://img.shields.io/npm/v/${packageName}.svg`,
    text: 'npm',
    link: `https://www.npmjs.com/package/${packageName}`
  };

  test('that the badges are defined', () => {
    assert.deepEqual(defineBadges(packageName), {consumer: {}, status: {}});
  });

  test('that the npm badge is returned for public projects', () => {
    assert.deepEqual(defineBadges(packageName, 'Public').consumer, {npm: npmBadgeDetails});
  });
});
