import {projectTypes} from '@form8ion/javascript-core';

function projectWillBeTested(contributors) {
  return contributors
    .filter(contributor => contributor.scripts)
    .reduce((acc, contributor) => ([...acc, ...Object.keys(contributor.scripts)]), [])
    .find(scriptName => scriptName.startsWith('test:'));
}

function projectShouldBeBuiltForVerification(contributorScripts) {
  return 'run-s build' === contributorScripts['pregenerate:md'];
}

function defineScripts(contributors) {
  const contributorScripts = contributors.map(contributor => contributor.scripts);
  const flattenedContributorScripts = contributorScripts.reduce((acc, scripts) => ({...acc, ...scripts}), {});

  return {
    test: `npm-run-all --print-label${
      projectShouldBeBuiltForVerification(flattenedContributorScripts) ? ' build' : ''
    } --parallel lint:*${
      projectWillBeTested(contributors) ? ' --parallel test:*' : ''
    }`
  };
}

function defineVcsHostDetails(vcs, packageType, packageName, pathWithinParent) {
  return vcs && 'github' === vcs.host && {
    repository: pathWithinParent
      ? {
        type: 'git',
        url: `https://github.com/${vcs.owner}/${vcs.name}.git`,
        directory: pathWithinParent
      }
      : `${vcs.owner}/${vcs.name}`,
    bugs: `https://github.com/${vcs.owner}/${vcs.name}/issues`,
    homepage: (projectTypes.PACKAGE === packageType)
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
  pathWithinParent
}) {
  return {
    name: packageName,
    description,
    license,
    ...packageProperties,
    ...defineVcsHostDetails(vcs, projectType, packageName, pathWithinParent),
    author: `${author.name}${author.email ? ` <${author.email}>` : ''}${author.url ? ` (${author.url})` : ''}`,
    scripts: defineScripts(contributors)
  };
}
