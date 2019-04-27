import any from '@travi/any';
import {assert} from 'chai';
import badgeDetailsBuilder from '../../src/badges';

suite('badges', () => {
  const contributors = any.listOf(() => ({
    consumer: any.simpleObject(),
    contribution: any.simpleObject(),
    status: any.simpleObject()
  }));
  const contributedConsumerBadges = contributors
    .map(contributor => contributor.consumer)
    .reduce((acc, badges) => ({...acc, ...badges}), {});
  const contributedContributionBadges = contributors
    .map(contributor => contributor.contribution)
    .reduce((acc, badges) => ({...acc, ...badges}), {});
  const contributedStatusBadges = contributors
    .map(contributor => contributor.status)
    .reduce((acc, badges) => ({...acc, ...badges}), {});

  test('that badges are collected from contributing results', () => {
    assert.deepEqual(
      badgeDetailsBuilder(null, null, null, {}, null, null, contributors),
      {
        consumer: contributedConsumerBadges,
        contribution: {
          'commit-convention': {
            img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
            text: 'Conventional Commits',
            link: 'https://conventionalcommits.org'
          },
          commitizen: {
            img: 'https://img.shields.io/badge/commitizen-friendly-brightgreen.svg',
            text: 'Commitizen friendly',
            link: 'http://commitizen.github.io/cz-cli/'
          },
          ...contributedContributionBadges
        },
        status: contributedStatusBadges
      }
    );
  });

  suite('ci', () => {
    test('that the ci badge is provided', async () => {
      const badge = any.simpleObject();

      const badges = badgeDetailsBuilder(null, null, null, {badge}, null, null, contributors);

      assert.equal(badges.status.ci, badge);
    });

    test('that the ci badge is not provided when not defined', async () => {
      const badges = badgeDetailsBuilder(null, null, null, {}, null, null, contributors);

      assert.notProperty(badges.status, 'ci');
    });
  });

  suite('coverage', () => {
    test('that the coverage badge is provided', async () => {
      const vcs = {host: 'GitHub', owner: any.word(), name: any.word()};
      const unitTested = true;

      const badges = badgeDetailsBuilder('Public', null, null, {}, unitTested, vcs, contributors);

      assert.deepEqual(badges.status.coverage, {
        img: `https://img.shields.io/codecov/c/github/${vcs.owner}/${vcs.name}.svg`,
        link: `https://codecov.io/github/${vcs.owner}/${vcs.name}`,
        text: 'Codecov'
      });
    });

    test('that the coverage badge is not provided for private projects', async () => {
      const badges = badgeDetailsBuilder('Private', null, null, {}, null, null, contributors);

      assert.notProperty(badges.status, 'coverage');
    });

    test('that the coverage badge is not provided when a project is not unit tested', async () => {
      const unitTested = false;

      const badges = badgeDetailsBuilder('Public', null, null, {}, unitTested, null, contributors);

      assert.notProperty(badges.status, 'coverage');
    });

    test('that the coverage badge is not provided when a project is not hosted on github', async () => {
      const vcs = {host: any.word(), owner: any.word(), name: any.word()};
      const unitTested = true;

      const badges = badgeDetailsBuilder('Public', null, null, {}, unitTested, vcs, contributors);

      assert.notProperty(badges.status, 'coverage');
    });

    test('that the coverage badge is not provided when a project is not versioned', async () => {
      const vcs = undefined;
      const unitTested = true;

      const badges = badgeDetailsBuilder('Public', null, null, {}, unitTested, vcs, contributors);

      assert.notProperty(badges.status, 'coverage');
    });
  });
});
