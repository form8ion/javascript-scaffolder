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

  test('that badges are collected from contributing results', () => assert.deepEqual(
    badgeDetailsBuilder(null, null, null, [...contributors, any.simpleObject()]),
    {
      consumer: contributedConsumerBadges,
      contribution: contributedContributionBadges,
      status: contributedStatusBadges
    }
  ));
});
