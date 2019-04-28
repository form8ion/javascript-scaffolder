export default function (visibility, unitTested, vcs, contributors) {
  return {
    consumer: contributors
      .map(contributor => contributor.badges && contributor.badges.consumer)
      .reduce((acc, badges) => ({...acc, ...badges}), {}),
    contribution: contributors
      .map(contributor => contributor.badges && contributor.badges.contribution)
      .reduce((acc, badges) => ({...acc, ...badges}), {}),
    status: {
      ...unitTested && 'Public' === visibility && vcs && 'GitHub' === vcs.host && {
        coverage: {
          img: `https://img.shields.io/codecov/c/github/${vcs.owner}/${vcs.name}.svg`,
          link: `https://codecov.io/github/${vcs.owner}/${vcs.name}`,
          text: 'Codecov'
        }
      },
      ...contributors
        .map(contributor => contributor.badges && contributor.badges.status)
        .reduce((acc, badges) => ({...acc, ...badges}), {})
    }
  };
}
