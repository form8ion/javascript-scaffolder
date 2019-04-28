import any from '@travi/any';
import {assert} from 'chai';
import badgeDetailsBuilder from '../../src/badges';

suite('badges', () => {
  const contributors = any.listOf(() => ({
    ...any.simpleObject(),
    badges: {
      consumer: any.simpleObject(),
      contribution: any.simpleObject(),
      status: any.simpleObject()
    }
  }));
  const contributedConsumerBadges = contributors
    .map(contributor => contributor.badges.consumer)
    .reduce((acc, badges) => ({...acc, ...badges}), {});
  const contributedContributionBadges = contributors
    .map(contributor => contributor.badges.contribution)
    .reduce((acc, badges) => ({...acc, ...badges}), {});
  const contributedStatusBadges = contributors
    .map(contributor => contributor.badges.status)
    .reduce((acc, badges) => ({...acc, ...badges}), {});

  test('that badges are collected from contributing results', () => {
    assert.deepEqual(
      badgeDetailsBuilder(null, null, null, {}, null, null, [...contributors, any.simpleObject()]),
      {
        consumer: contributedConsumerBadges,
        contribution: contributedContributionBadges,
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
