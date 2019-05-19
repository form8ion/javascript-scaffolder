function defineScripts(tests, contributors) {
  return {
    test: `npm-run-all --print-label --parallel lint:*${(tests.unit || tests.integration) ? ' --parallel test:*' : ''}`,
    ...contributors.map(contributor => contributor.scripts).reduce((acc, scripts) => ({...acc, ...scripts}), {})
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
  tests,
  vcs,
  author,
  description,
  contributors,
  packageProperties
}) {
  return {
    name: packageName,
    description,
    license,
    ...packageProperties,
    ...defineVcsHostDetails(vcs, projectType, packageName),
    author: `${author.name}${author.email ? ` <${author.email}>` : ''}${author.url ? ` (${author.url})` : ''}`,
    scripts: defineScripts(tests, contributors)
  };
}
