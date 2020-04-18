function projectWillBeTested(contributors) {
  return contributors
    .filter(contributor => contributor.scripts)
    .reduce((acc, contributor) => ([...acc, ...Object.keys(contributor.scripts)]), [])
    .find(scriptName => scriptName.startsWith('test:'));
}

function projectShouldBeBuildForVerification(contributorScripts) {
  return 'npm run build' === contributorScripts['pregenerate:md'];
}

function defineScripts(contributors) {
  const contributorScripts = contributors.map(contributor => contributor.scripts);
  const flattenedContributorScripts = contributorScripts.reduce((acc, scripts) => ({...acc, ...scripts}), {});

  return {
    test: `npm-run-all --print-label${
      projectShouldBeBuildForVerification(flattenedContributorScripts) ? ' build' : ''
    } --parallel lint:*${
      projectWillBeTested(contributors) ? ' --parallel test:*' : ''
    }`,
    ...flattenedContributorScripts
  };
}

function defineVcsHostDetails(vcs, packageType, packageName) {
  return vcs && 'GitHub' === vcs.host && {
    repository: `${vcs.owner}/${vcs.name}`,
    bugs: `https://github.com/${vcs.owner}/${vcs.name}/issues`,
    homepage: ('Package' === packageType)
      ? `https://npm.im/${packageName}`
      : `https://github.com/${vcs.owner}/${vcs.name}#readme`
  };
}

export default function ({
  packageName,
  projectType,
  license,
  vcs,
  author,
  description,
  contributors,
  packageProperties,
  keywords
}) {
  return {
    name: packageName,
    description,
    license,
    ...packageProperties,
    keywords,
    ...defineVcsHostDetails(vcs, projectType, packageName),
    author: `${author.name}${author.email ? ` <${author.email}>` : ''}${author.url ? ` (${author.url})` : ''}`,
    scripts: defineScripts(contributors)
  };
}
