export default function (visibility, packageType, packageName, ciService, unitTested, vcs, contributors) {
  return {
    consumer: contributors.map(contributor => contributor.consumer).reduce((acc, badges) => ({...acc, ...badges}), {}),
    contribution: contributors
      .map(contributor => contributor.contribution)
      .reduce((acc, badges) => ({...acc, ...badges}), {}),
    status: {
      ...ciService.badge && {ci: ciService.badge},
      ...unitTested && 'Public' === visibility && vcs && 'GitHub' === vcs.host && {
        coverage: {
          img: `https://img.shields.io/codecov/c/github/${vcs.owner}/${vcs.name}.svg`,
          link: `https://codecov.io/github/${vcs.owner}/${vcs.name}`,
          text: 'Codecov'
        }
      },
      ...contributors.map(contributor => contributor.status).reduce((acc, badges) => ({...acc, ...badges}), {})
    }
  };
}
