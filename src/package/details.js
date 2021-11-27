import {dialects, projectTypes} from '@form8ion/javascript-core';

function projectWillBeTested(scripts) {
  return Object.keys(scripts).find(scriptName => scriptName.startsWith('test:'));
}

function projectShouldBeBuiltForVerification(scripts) {
  return 'run-s build' === scripts['pregenerate:md'];
}

function defineScripts(scripts) {
  return {
    test: `npm-run-all --print-label${
      projectShouldBeBuiltForVerification(scripts) ? ' build' : ''
    } --parallel lint:*${
      projectWillBeTested(scripts) ? ' --parallel test:*' : ''
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
  dialect,
  license,
  vcs,
  author,
  description,
  scripts,
  packageProperties,
  pathWithinParent
}) {
  return {
    name: packageName,
    description,
    license,
    type: dialects.ESM === dialect ? 'module' : 'commonjs',
    ...packageProperties,
    ...defineVcsHostDetails(vcs, projectType, packageName, pathWithinParent),
    author: `${author.name}${author.email ? ` <${author.email}>` : ''}${author.url ? ` (${author.url})` : ''}`,
    scripts: defineScripts(scripts)
  };
}
