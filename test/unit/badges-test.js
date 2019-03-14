import any from '@travi/any';
import {assert} from 'chai';
import badgeDetailsBuilder from '../../src/badges';

suite('badges', () => {
  test('that the npm badge is defined for public packages', async () => {
    const packageName = any.word();

    const badges = badgeDetailsBuilder('Public', 'Package', packageName, {});

    assert.deepEqual(badges.consumer.npm, {
      img: `https://img.shields.io/npm/v/${packageName}.svg`,
      text: 'npm',
      link: `https://www.npmjs.com/package/${packageName}`
    });
  });

  test('that the npm badge is not defined for private packages', async () => {
    const badges = badgeDetailsBuilder('Private', null, null, {});

    assert.isUndefined(badges.consumer.npm);
  });

  test('that the npm badge is not defined if the project is not a package', async () => {
    const badges = badgeDetailsBuilder('Public', any.word(), null, {});

    assert.isUndefined(badges.consumer.npm);
  });

  test('that the commit-convention badges are provided', async () => {
    const badges = badgeDetailsBuilder(null, null, null, {});

    assert.deepEqual(badges.contribution['commit-convention'], {
      img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
      text: 'Conventional Commits',
      link: 'https://conventionalcommits.org'
    });
    assert.deepEqual(badges.contribution.commitizen, {
      img: 'https://img.shields.io/badge/commitizen-friendly-brightgreen.svg',
      text: 'Commitizen friendly',
      link: 'http://commitizen.github.io/cz-cli/'
    });
  });

  suite('semantic-release', () => {
    test('that the semantic-release badge is provided for packages', async () => {
      const badges = badgeDetailsBuilder(null, 'Package', null, {});

      assert.deepEqual(badges.contribution['semantic-release'], {
        img: 'https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg',
        text: 'semantic-release',
        link: 'https://github.com/semantic-release/semantic-release'
      });
    });

    test('that the semantic-release badge is not provided for non-packages', async () => {
      const badges = badgeDetailsBuilder(null, any.word(), null, {});

      assert.notProperty(badges.contribution, 'semantic-release');
    });
  });

  test('that the ci badge is provided', async () => {
    const badge = any.simpleObject();

    const badges = badgeDetailsBuilder(null, null, null, {badge});

    assert.equal(badges.status.ci, badge);
  });

  test('that the ci badge is not provided when not defined', async () => {
    const badges = badgeDetailsBuilder(null, null, null, {});

    assert.notProperty(badges.status, 'ci');
  });

  suite('coverage', () => {
    test('that the coverage badge is provided', async () => {
      const vcs = {owner: any.word(), name: any.word()};
      const unitTested = true;

      const badges = badgeDetailsBuilder('Public', null, null, {}, unitTested, vcs);

      assert.deepEqual(badges.status.coverage, {
        img: `https://img.shields.io/codecov/c/github/${vcs.owner}/${vcs.name}.svg`,
        link: `https://codecov.io/github/${vcs.owner}/${vcs.name}`,
        text: 'Codecov'
      });
    });

    test('that the coverage badge is not provided for private projects', async () => {
      const badges = badgeDetailsBuilder('Private', null, null, {});

      assert.notProperty(badges.status, 'coverage');
    });

    test('that the coverage badge is not provided when a project is not unit tested', async () => {
      const unitTested = false;

      const badges = badgeDetailsBuilder('Public', null, null, {}, unitTested);

      assert.notProperty(badges.status, 'coverage');
    });
  });
});
